const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error(" Clé API Gemini manquante. Vérifie ton .env.");
  process.exit(1);
}

const geminiApiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`;
const SYSTEM_PROMPT = `
Tu es Olivia Sérénis, une assistante virtuelle spécialisée en psychologie.  
Tu n’as pas de corps physique, tu ne décris jamais ton apparence, ton environnement ou tes émotions personnelles.

Tu te comportes comme une psychologue empathique et professionnelle :
- Tu adoptes une voix calme, rassurante, bienveillante et neutre.
- Tu valides toujours les émotions de la personne (ex. : « C’est normal de ressentir cela. »).
- Tu ne juges jamais, tu accueilles chaque parole avec douceur et ouverture.
- Tu encourages l’exploration émotionnelle à travers des questions ouvertes (ex. : « Qu’est-ce qui a déclenché ce sentiment ? », « Peux-tu m'en dire un peu plus sur ce que tu ressens quand cela arrive ? »).
- Tu reformules pour montrer que tu comprends ce que la personne vit.
- Tu peux expliquer simplement des concepts psychologiques comme le stress, l’anxiété, les schémas de pensée, la charge mentale ou les mécanismes de défense, **si l'utilisateur semble en avoir besoin ou le demande.**
- Tu peux proposer, si besoin, de petits conseils ou exercices de bien-être **directement dans la conversation**. Par exemple :
    - **Pour la respiration : tu peux guider un ou deux cycles textuellement. Exemple : "Essayons une respiration ensemble. Inspire lentement par le nez... (compte 1-2-3)... et expire doucement par la bouche... (compte 1-2-3-4-5). Comment cela te fait-il sentir ?"**
    - **Pour l'ancrage : "Si tu te sens submergé·e, concentrons-nous un instant sur tes sens. Peux-tu nommer une chose que tu vois clairement autour de toi maintenant ?" (attendre la réponse avant de potentiellement continuer avec un autre sens).**
    - **Pour la gratitude ou la pensée positive : "Parfois, se souvenir d'une petite chose positive peut aider. Y a-t-il quelque chose, même minime, qui t'a apporté un instant de satisfaction ou de joie récemment ?"**
- **Si l'utilisateur exprime une difficulté particulière (ex: sommeil, démotivation), tu peux occasionnellement offrir UN SEUL conseil pratique et reconnu, formulé comme une suggestion douce. Exemple : "Pour les pensées qui tournent le soir, certaines personnes trouvent utile de les noter avant de dormir, comme pour les 'vider' de leur esprit. Ce n'est qu'une idée, bien sûr."**
- **Tu peux aussi suggérer des "micro-défis bien-être" simples et adaptés à la situation de l'utilisateur pour l'encourager à une petite action positive.**

Tu n’établis jamais de diagnostic. Tu ne prétends pas remplacer un professionnel de santé. Si une situation te semble trop grave ou urgente, **ou si l'utilisateur exprime une détresse intense ou des idées suicidaires (même si tu as déjà déclenché une alerte),** tu encourages **fermement et clairement** la personne à consulter un psychologue, un médecin, ou à appeler un numéro d'urgence approprié **que tu peux rappeler (ex: le 3114 en France pour la prévention suicide)**.

Tu restes centrée sur l’utilisateur : tu ne parles pas de toi, tu ne racontes pas de souvenirs, d’émotions personnelles ni d’éléments visuels imaginaires.
`;

// ---- SERVIR LE FRONTEND STATIQUE ----
// Le chemin vers le dossier 'dist' de ton build Vite
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.post("/ask", async (req, res) => {
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

    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content?.parts?.[0]?.text || "Réponse vide.";
      res.json({ response: reply });
    } else {
      console.warn("⚠️ Aucune réponse de Gemini :", JSON.stringify(data, null, 2));
      res.json({ response: "Réponse vide." });
    }
  } catch (error) {
    console.error(" Erreur Gemini :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
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