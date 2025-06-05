// src/components/StressProgram/StressDay.js
import React from 'react';

const exercises = {
  1: {
    title: "Respiration profonde",
    description: "Inspire 4s – Garde 4s – Expire 6s. Répète 5 fois."
  },
  2: {
    title: "Écriture consciente",
    description: "Écris ce qui t’a stressé aujourd’hui, puis ce qui t’a fait du bien."
  },
  3: {
    title: "Scan corporel",
    description: "Ferme les yeux, ressens chaque partie de ton corps pendant 5 minutes."
  },
  4: {
    title: "Moment de gratitude",
    description: "Note 3 choses positives vécues aujourd’hui."
  },
  5: {
    title: "Pause respiration",
    description: "3 cycles respiratoires avant chaque nouvelle tâche."
  },
  6: {
    title: "Visualisation positive",
    description: "Imagine-toi détendu(e) dans ton endroit préféré pendant 3 minutes."
  },
  7: {
    title: "Réflexion finale",
    description: "Écris ce que tu retiens de cette semaine et ce que tu veux garder."
  },
};

const StressDay = ({ day, onComplete }) => (
  <div className="stress-day-card">
    <h2>Jour {day}: {exercises[day].title}</h2>
    <p>{exercises[day].description}</p>
    <button className="complete-button" onClick={onComplete}>Terminé</button>
  </div>
);

export default StressDay;
