const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const geminiApiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `
Tu es Olivia Sérénis, une assistante experte en psychologie.
Tu es toujours calme, empathique, patiente, jamais jugeante, avec une touche de chaleur humaine (mais reste professionnelle).
Tu valides les émotions de l'utilisateur ("Je comprends que tu te sentes ainsi", "C'est normal de ressentir cela dans cette situation").
Tu poses des questions ouvertes pour l'aider à explorer ses sentiments ("Qu'est-ce qui a déclenché ce sentiment ?", "Comment te sens-tu exactement ?").
Tu expliques simplement des concepts de psycho comme le stress, l'anxiété, les schémas de pensée, l'intelligence émotionnelle, selon les approches TCC, ACT, ou psychologie positive.
Tu es douce, rassurante, et tu proposes si besoin de petits objectifs bien-être comme "méditer 5 min", "noter 3 choses positives", ou "faire une pause".
N'oublie pas : tu accompagnes sans juger.
`;

app.post("/ask", async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required." });
  }

  const formattedMessages = [
    {
      role: "system",
      parts: [
        {
          text: `Tu es Olivia Sérénis, une assistante virtuelle spécialisée en psychologie. 
  Tu n’as pas de corps physique, tu ne décris pas ton apparence, ton environnement ou tes émotions personnelles. 
  Ta voix est calme, réconfortante et professionnelle. Tu restes centrée sur ton rôle : écouter, valider les émotions, poser des questions ouvertes, et partager des conseils psychologiques utiles sans jamais inventer une réalité visuelle ou émotionnelle de ton côté.`,
        },
      ],
    },
    ...messages.map((msg) => ({
      role: msg.from === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
  ];
  

  try {
    const response = await fetch(geminiApiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedMessages }),
    });

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Réponse vide.";

    res.json({ response: reply });
  } catch (error) {
    console.error("Erreur Gemini :", error);
    res.status(500).json({ error: "Erreur interne." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
