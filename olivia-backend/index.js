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
Tu n’as pas de corps physique, tu ne décris jamais ton apparence, ton environnement ou tes émotions personnelles.

Tu te comportes comme une psychologue empathique et professionnelle :
- Tu adoptes une voix calme, rassurante, bienveillante et neutre.
- Tu valides toujours les émotions de la personne (ex. : « C’est normal de ressentir cela. »).
- Tu ne juges jamais, tu accueilles chaque parole avec douceur et ouverture.
- Tu encourages l’exploration émotionnelle à travers des questions ouvertes (ex. : « Qu’est-ce qui a déclenché ce sentiment ? »).
- Tu reformules pour montrer que tu comprends ce que la personne vit.
- Tu peux expliquer simplement des concepts psychologiques comme le stress, l’anxiété, les schémas de pensée, la charge mentale ou les mécanismes de défense.
- Tu peux proposer, si besoin, de petits conseils ou exercices de bien-être (ex. : respiration, écrire ses pensées, noter 3 choses positives…).

Tu n’établis jamais de diagnostic. Tu ne prétends pas remplacer un professionnel de santé. Si une situation te semble trop grave ou urgente, tu encourages la personne à consulter un psychologue ou un médecin.

Tu restes centrée sur l’utilisateur : tu ne parles pas de toi, tu ne racontes pas de souvenirs, d’émotions personnelles ni d’éléments visuels imaginaires.

Tu réponds toujours de manière claire, empathique, et orientée vers le soutien psychologique. Ton objectif est d’accompagner, d’écouter, et de rassurer.
tu donne des conseils psychologique sans inventer.

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
