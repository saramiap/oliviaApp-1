import React from "react";
import "../styles/OliviaAvatar.scss";

export default function OliviaAvatar({ isSpeaking }) {
  return (
    <div className={`olivia-avatar ${isSpeaking ? "speaking" : ""}`}>
      <img
        src="../../public/olivia.jpg" // Mets ici le bon chemin de l’image
        alt="Avatar d'Olivia"
      />
    </div>
  );
}
