import React, { useState } from "react";
import ChatInterface from "./ChatInterface"; // ton chat Olivia
import JournalInterface from "./JournalInterface"; // le mode carnet silencieux
import MeditationWidget from "./MeditationWidget"; // widget respiration/relax
import EmotionTracker from "./EmotionTracker"; // carnet d’émotions

const AppChat = () => {
  const [currentMode, setCurrentMode] = useState(null);

  return (
    <div className="app-chat-container">
      {!currentMode && (
        <div className="mode-selector">
          <h2>Comment te sens-tu aujourd’hui ? Choisis un espace :</h2>
          <div className="mode-options">
            <button onClick={() => setCurrentMode("chat")}>💬 Parler à Olivia</button>
            <button onClick={() => setCurrentMode("journal")}>✍️ Écrire pour moi</button>
            <button onClick={() => setCurrentMode("meditation")}>🧘 Se détendre</button>
            <button onClick={() => setCurrentMode("emotions")}>📓 Mes émotions</button>
          </div>
        </div>
      )}

      {currentMode === "chat" && <ChatInterface onBack={() => setCurrentMode(null)} />}
      {currentMode === "journal" && <JournalInterface onBack={() => setCurrentMode(null)} />}
      {currentMode === "meditation" && <MeditationWidget onBack={() => setCurrentMode(null)} />}
      {currentMode === "emotions" && <EmotionTracker onBack={() => setCurrentMode(null)} />}
    </div>
  );
};

export default AppChat;
