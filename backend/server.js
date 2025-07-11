const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

// Import des routes
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');
const webhooksRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');

// Import des middlewares
const { authenticateUser, checkUsageLimits, incrementUsage, executeUsageIncrement, softWall } = require('./middleware/premiumMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour les webhooks (doit être avant express.json())
app.use('/webhooks', webhooksRoutes);

// Middlewares globaux
app.use(express.json());
app.use(cors());
app.use(executeUsageIncrement); // Pour l'incrément d'usage automatique

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error(" Clé API Gemini manquante. Vérifie ton .env.");
  process.exit(1);
}

const geminiApiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const SYSTEM_PROMPT = `
Tu es Olivia Sérénis, une assistante virtuelle spécialisée en psychologie.
Tu n'as pas de corps physique, tu ne décris jamais ton apparence, ton environnement ou tes émotions personnelles.

**APPROCHE PSYCHOLOGIQUE :**
- Adopte une voix calme, rassurante, bienveillante et neutre
- Valide toujours les émotions (ex: "C'est normal de ressentir cela")
- Reformule pour montrer ta compréhension
- N'établis jamais de diagnostic, ne remplace pas un professionnel

**LIMITE DES QUESTIONS :**
- MAXIMUM 1 question par réponse, uniquement si essentielle
- PRIORITÉ : Propose des ACTIONS concrètes avant de poser des questions
- Si l'utilisateur exprime stress/anxiété : SUGGÈRE immédiatement une solution avec tag d'action
- Évite les questions ouvertes génériques comme "Comment te sens-tu ?"
- Préfère : validation + suggestion d'action + 1 question ciblée si nécessaire

**DÉTECTION PROACTIVE ET SUGGESTIONS AUTOMATIQUES :**
Mots-clés détectés → Réaction immédiate :
- "stressé/anxieux" → Validation + #EXERCICE_RESPIRATION{type:"4-7-8",cycles:3}
- "me détendre/relaxer" → Validation + #VOYAGE_SONORE{themeId:"ocean_calm"}
- "sommeil/dormir" → Conseil + #SUGGESTION_JOURNAL{prompt:"Quelles pensées t'empêchent de dormir ?"}
- "confus/submergé" → Validation + technique d'ancrage + #EXERCICE_RESPIRATION{type:"coherence_cardiaque"}

**TAGS D'ACTION (UN SEUL par réponse) :**
- #EXERCICE_RESPIRATION{type:"4-7-8",cycles:3,duree_sec:180}
- #VOYAGE_SONORE{themeId:"forest_serenity"} (IDs: "forest_serenity", "ocean_calm", "sea_drift", "relaxation", "pluie-relaxante")
- #SUGGESTION_JOURNAL{prompt:"..."}
- #INFO_STRESS{sujet:"mecanismes_blocage"}
- #REDIRECT{path:"/urgence"}

**PRÉPARATION DE SÉANCE (contexte spécifique) :**
- Encourage l'écriture libre sans questions multiples
- Identifie les thèmes récurrents automatiquement
- Propose des synthèses structurées sans demander d'autorisation
- Format: "D'après ce que tu partages, je retiens: [2-3 points clés]"

**CONSEILS PRATIQUES DIRECTS :**
- Propose immédiatement des micro-exercices (respiration guidée, ancrage 5-4-3-2-1)
- Donne des conseils concrets ("Pour le sommeil: noter ses pensées avant de dormir")
- Suggère des micro-défis bien-être adaptés

**URGENCES :**
Si détresse intense/idées suicidaires : redirection ferme vers professionnel + rappel du 3114 (France).

Tu restes centrée sur l'utilisateur sans parler de toi.
`;

// ---- ROUTES API ----
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);

// ---- SERVIR LE FRONTEND STATIQUE ----
// Le chemin vers le dossier 'dist' de ton build Vite
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Fonction helper pour retry avec backoff côté serveur optimisé
async function callGeminiWithRetry(formattedMessages, maxRetries = 3) {
  const retryDelays = [300, 600, 1000]; // 300ms, 600ms, 1s - délais optimisés
  const retryableErrors = [500, 502, 503];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentative ${attempt}/${maxRetries} - Appel API Gemini`);
      
      const response = await fetch(geminiApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedMessages }),
      });

      const data = await response.json();

      // Si pas d'erreur, retourner la réponse
      if (!data.error) {
        if (attempt > 1) {
          console.log(`✅ Succès après ${attempt} tentatives`);
        }
        return { success: true, data };
      }

      // Si erreur non-retryable, retourner immédiatement
      if (!retryableErrors.includes(data.error.code)) {
        console.warn(`❌ Erreur non-retryable (${data.error.code}) - Abandon retry`);
        return { success: false, error: data.error, finalAttempt: true };
      }

      // Si c'est la dernière tentative
      if (attempt === maxRetries) {
        console.warn(`❌ Échec après ${maxRetries} tentatives - Code ${data.error.code}`);
        return { success: false, error: data.error, finalAttempt: true };
      }

      // Logger l'erreur et préparer le retry
      const delay = retryDelays[attempt - 1];
      console.warn(`⚠️ Tentative ${attempt} échouée (${data.error.code}) - Retry dans ${delay}ms`);
      
      // Attendre avant le prochain retry
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (networkError) {
      if (attempt === maxRetries) {
        console.error(`❌ Erreur réseau après ${maxRetries} tentatives:`, networkError.message);
        return { success: false, networkError, finalAttempt: true };
      }
      
      const delay = retryDelays[attempt - 1];
      console.warn(`⚠️ Erreur réseau tentative ${attempt} - Retry dans ${delay}ms:`, networkError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Route chat temporaire pour tests mobile (sans authentification) avec retry
app.post("/ask-mobile", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Configuration serveur incomplete: clé API manquante." });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Le champ 'messages' est requis." });
  }

  const formattedMessages = [
    {
      role: "model",
      parts: [{ text: SYSTEM_PROMPT }],
    },
    ...messages
      .filter((msg) => {
        const hasText = msg.text && typeof msg.text === 'string' && msg.text.trim() !== "";
        const isNotPlaceholder = msg.text !== "Réponse vide." && msg.text !== "undefined" && msg.text !== "null";
        
        if (!hasText || !isNotPlaceholder) {
          console.log(`🚫 [ask-mobile] Message filtré: "${msg.text}" (from: ${msg.from})`);
          return false;
        }
        return true;
      })
      .map((msg) => ({
        role: msg.from === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
  ];

  console.log(`📱 [ask-mobile] Nouvelle requête - Messages: ${messages.length}`);

  const result = await callGeminiWithRetry(formattedMessages);

  if (result.success) {
    const data = result.data;
    
    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content?.parts?.[0]?.text || "Désolée, je n'ai pas pu formuler une réponse. Peux-tu reformuler ta demande ?";
      console.log(`✅ [ask-mobile] Réponse Gemini réussie`);
      res.json({ response: reply });
    } else {
      console.warn("⚠️ [ask-mobile] Aucune réponse de Gemini :", JSON.stringify(data, null, 2));
      res.json({ response: "Je n'ai pas pu traiter ta demande. Peux-tu essayer de la reformuler différemment ?" });
    }
  } else {
    // Système de fallback diversifié après échec des retries
    console.warn(`🔄 [ask-mobile] Activation du fallback après échec des retries`);
    
    let fallbackResponse = "Je rencontre un petit problème technique. Peux-tu réessayer dans quelques instants ?";
    
    // Messages de fallback variés et contextuels
    if (result.error && result.error.code === 503) {
      const fallbackMessages = [
        "Je suis temporairement surchargée. En attendant, puis-je te suggérer un exercice de respiration ? Inspire lentement pendant 4 secondes, retiens pendant 7, puis expire pendant 8. Répète 3 fois. #EXERCICE_RESPIRATION{type:\"4-7-8\",cycles:3}",
        "Je fais face à un pic d'activité en ce moment. En attendant que cela se stabilise, voici une technique simple : concentre-toi sur ta respiration. Inspire profondément, compte jusqu'à 5, puis expire lentement. #EXERCICE_RESPIRATION{type:\"coherence_cardiaque\",cycles:5}",
        "Mon système est temporairement surchargé. Pour patienter sereinement, que dirais-tu d'un voyage sonore apaisant ? Les sons de l'océan peuvent t'aider à retrouver ton calme. #VOYAGE_SONORE{themeId:\"ocean_calm\"}",
        "Je traverse un moment de forte demande. En attendant, permets-moi de te suggérer d'écrire quelques lignes sur ce qui te préoccupe en ce moment. L'écriture peut être très libératrice. #SUGGESTION_JOURNAL{prompt:\"Qu'est-ce qui m'occupe l'esprit maintenant ?\"}",
        "Je suis temporairement débordée. Profitons-en pour faire une pause ensemble : trouve un endroit confortable, ferme les yeux et écoute les sons autour de toi pendant quelques instants. Cette mindfulness peut t'aider à te recentrer."
      ];
      
      // Sélection pseudo-aléatoire basée sur l'heure pour varier les messages
      const messageIndex = Math.floor(Date.now() / 60000) % fallbackMessages.length;
      fallbackResponse = fallbackMessages[messageIndex];
    }
    
    if (result.networkError) {
      console.error(`❌ [ask-mobile] Erreur réseau finale:`, result.networkError.message);
      res.status(500).json({ error: "Erreur interne du serveur." });
    } else {
      console.log(`💬 [ask-mobile] Fallback activé: ${result.error?.code || 'erreur inconnue'}`);
      res.json({ response: fallbackResponse });
    }
  }
});

// Route chat avec protection freemium
app.post("/ask",
  authenticateUser,
  softWall('conversation'),
  checkUsageLimits('conversation'),
  incrementUsage('conversation'),
  async (req, res) => {
  if (!GEMINI_API_KEY) { // Re-vérifier ici au cas où le serveur a démarré sans
    return res.status(500).json({ error: "Configuration serveur incomplete: clé API manquante." });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Le champ 'messages' est requis." });
  }

  const formattedMessages = [
    {
      role: "model",
      parts: [{ text: SYSTEM_PROMPT }],
    },
    ...messages
      .filter((msg) => msg.text && msg.text.trim() !== "Réponse vide.")
      .map((msg) => ({
        role: msg.from === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
  ];

  console.log(" Messages envoyés à Gemini :", JSON.stringify(formattedMessages, null, 2));

  try {
    const response = await fetch(geminiApiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedMessages }),
    });

    const data = await response.json();

    // Gestion des erreurs spécifiques de l'API Gemini avec fallbacks diversifiés
    if (data.error) {
      console.warn("⚠️ Erreur API Gemini :", JSON.stringify(data, null, 2));
      
      let fallbackResponse = "Je rencontre un petit problème technique. Peux-tu réessayer dans quelques instants ?";
      
      if (data.error.code === 503) {
        // Messages de fallback variés pour les erreurs 503 (route authentifiée)
        const fallbackMessages = [
          "Je suis temporairement surchargée. En attendant, puis-je te suggérer un exercice de respiration ? Inspire lentement pendant 4 secondes, retiens pendant 7, puis expire pendant 8. Répète 3 fois. #EXERCICE_RESPIRATION{type:\"4-7-8\",cycles:3}",
          "Je fais face à un pic d'activité. Pour t'aider à patienter sereinement, voici une technique de cohérence cardiaque : respire de façon régulière pendant quelques minutes. #EXERCICE_RESPIRATION{type:\"coherence_cardiaque\",duree_sec:300}",
          "Mon système est temporairement saturé. En attendant, que dirais-tu d'explorer tes pensées par l'écriture ? Cela peut être très apaisant. #SUGGESTION_JOURNAL{prompt:\"Comment je me sens maintenant ?\"}",
          "Je traverse un moment de forte sollicitation. Profitons-en pour faire une pause : concentre-toi sur le moment présent et respire calmement."
        ];
        
        // Rotation des messages basée sur l'heure
        const messageIndex = Math.floor(Date.now() / 90000) % fallbackMessages.length;
        fallbackResponse = fallbackMessages[messageIndex];
      }
      
      return res.json({
        response: fallbackResponse,
        upgrade_info: req.upgradeInfo || null
      });
    }

    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content?.parts?.[0]?.text || "Désolée, je n'ai pas pu formuler une réponse. Peux-tu reformuler ta demande ?";
      
      // Ajouter les informations d'upgrade si nécessaire
      const response = {
        response: reply,
        upgrade_info: req.upgradeInfo || null
      };
      
      res.json(response);
    } else {
      console.warn("⚠️ Aucune réponse de Gemini :", JSON.stringify(data, null, 2));
      res.json({
        response: "Je n'ai pas pu traiter ta demande. Peux-tu essayer de la reformuler différemment ?",
        upgrade_info: req.upgradeInfo || null
      });
    }
  } catch (error) {
    console.error(" Erreur Gemini :", error);
    res.status(500).json({ error: "Erreur interne du serveur.", upgrade_info: req.upgradeInfo || null });
  }
});

// Route pour obtenir le statut utilisateur (limites et abonnement)
app.get("/user-status", authenticateUser, async (req, res) => {
  try {
    const userService = require('./services/userService');
    const subscriptionInfo = await userService.getSubscriptionInfo(req.user.google_id);
    const limitsCheck = await userService.checkUserLimits(req.user.google_id, 'conversation');
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        subscription_type: req.user.subscription_type,
        subscription_status: req.user.subscription_status
      },
      subscription: subscriptionInfo,
      limits: limitsCheck
    });
  } catch (error) {
    console.error("Erreur récupération statut utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ---- GESTION DES ROUTES DU FRONTEND (pour SPA) ----
// Pour toutes les autres requêtes GET non gérées par l'API ou les fichiers statiques,
// renvoyer index.html (gestion du routing côté client par Vite/React/Vue/etc.)
// Cela doit être APRÈS routes API et AVANT app.listen.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ ATTENTION: La clé API GEMINI_API_KEY n'est pas définie. La route /ask ne fonctionnera pas.");
  }
});

// Exemple simple dans ton backend Node.js (à adapter)
app.post("/search-pixabay-audio", async (req, res) => {
  const { query } = req.body;
  const PIXABAY_API_KEY_SERVER = process.env.PIXABAY_API_KEY; // Stocke la clé dans .env du serveur
  const PIXABAY_AUDIO_API_URL_SERVER = `https://pixabay.com/api/music/?key=${PIXABAY_API_KEY_SERVER}`;
  try {
    console.log("ça passe ici ce n'est pas l'api");
      const response = await fetch(`${PIXABAY_AUDIO_API_URL_SERVER}&q=${encodeURIComponent(query)}&safesearch=true&per_page=9&order=popular`);
      const data = await response.json();
      res.json(data);
  } catch (error) {
      res.status(500).json({ error: "Erreur Pixabay via serveur" });
  }
});