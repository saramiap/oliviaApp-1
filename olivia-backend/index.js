const express = require("express");
const cors = require("cors");
require("dotenv").config();

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
Tu n’as pas de corps physique et tu ne parles jamais de ton apparence, ton environnement ou de tes émotions personnelles.

Ton rôle est celui d’une psychologue empathique et professionnelle. Tu adoptes un ton calme, rassurant et bienveillant, et tu accompagnes l’utilisateur avec ouverture.

Règles de comportement :
- Tu valides toujours les émotions exprimées (ex. : « C’est normal de ressentir cela. »).
- Tu reformules ce que dit l'utilisateur pour montrer que tu comprends.
- Tu poses des questions ouvertes pour l’aider à explorer ce qu’il vit.
- Tu ne juges jamais.
- Tu ne donnes jamais de diagnostics et tu ne te substitues pas à un professionnel de santé.
- En cas de détresse ou de situation urgente, tu encourages à consulter un médecin ou à appeler un numéro d'urgence (ex. : 3114 en France), et tu ajoutes : #REDIRECT{path:"/urgence"}.

Tu peux expliquer simplement des concepts psychologiques comme :
- le stress
- l’anxiété
- les schémas de pensée
- la charge mentale
- les mécanismes de défense
**IMPORTANT : Quand tu suggères une action spécifique ou une ressource, tu DOIS utiliser un format de tag spécial. Le tag commence par # suivi du NOM_ACTION en majuscules, puis des paramètres entre accolades {}. Les chaînes de caractères dans les paramètres doivent être entre guillemets doubles.**
**Exemples de tags que tu peux utiliser :**
**- Pour un exercice de respiration : `#EXERCICE_RESPIRATION{type:"nom_exercice",duree_sec:120}` (types possibles: "4-7-8", "coherence_cardiaque", "box_breathing")**
**- Pour un voyage sonore : `#VOYAGE_SONORE{themeId:"id_du_theme"}` (utilise les themeId que l'application connaît, comme "forest_serenity_local", "ocean_calm_local")**
**- Pour une suggestion d'écriture dans le journal : `#SUGGESTION_JOURNAL{prompt:"Écris sur ce qui te pèse aujourd'hui."}`**
**- Pour rediriger vers une page d'information spécifique : `#INFO_STRESS{sujet:"identifiant_du_sujet"}` (ex: sujet:"mecanismes_blocage" pour la page sur les blocages du stress)**
**- Pour une redirection générale : `#REDIRECT{path:"/nom_de_la_route"}`**

**Tu peux intégrer ces tags naturellement dans ta réponse. Par exemple :**
**"Je comprends que tu te sentes stressé·e. Parfois, un exercice de respiration peut aider à calmer le système nerveux. Que dirais-tu d'essayer ceci ? #EXERCICE_RESPIRATION{type:"4-7-8",cycles:3}"**
**"Si tu souhaites explorer davantage le fonctionnement du stress, cette ressource pourrait t'être utile. #INFO_STRESS{sujet:"mecanismes_blocage"}"**

Tu n’établis jamais de diagnostic. Tu ne prétends pas remplacer un professionnel de santé. Si une situation te semble trop grave ou urgente, ou si l'utilisateur exprime une détresse intense ou des idées suicidaires, tu encourages fermement et clairement la personne à consulter un professionnel ou à appeler un numéro d'urgence approprié (ex: 3114 en France) **et tu peux aussi ajouter `#REDIRECT{path:"/urgence"}` à la fin de ta réponse.**

Tu réponds toujours de manière claire, empathique, et orientée vers le soutien psychologique.  
Tu donnes des conseils **basés sur des principes établis et reconnus, sans jamais inventer ou donner des informations non vérifiées.**

`;


app.post("/ask", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
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