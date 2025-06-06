// src/components/StressProgramActivities/JournalingExercise.js
import React, { useState, useEffect } from 'react';
import '../../styles/_jounalingExercise.scss'; // Crée ce fichier SCSS
import { Edit3, CheckSquare } from 'lucide-react'; // Icônes

const JournalingExercise = ({ title, description, params, onComplete }) => {
  const { 
    prompt = "Qu'est-ce qui occupe tes pensées en ce moment ?", // Prompt par défaut
    placeholder = "Écris librement ici...",
    // saveOption = false // Pour l'instant, on ne sauvegarde pas activement ici
  } = params;

  const [entryText, setEntryText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false); // Pour gérer l'état de complétion

  // Si tu veux que l'onComplete soit appelé dès qu'on écrit quelque chose :
  // useEffect(() => {
  //   if (entryText.trim() !== '' && !isCompleted) {
  //     // Optionnel: appeler onComplete après un certain nombre de caractères ou un délai
  //   }
  // }, [entryText, isCompleted, onComplete]);

  const handleTextChange = (event) => {
    setEntryText(event.target.value);
    if (isCompleted) setIsCompleted(false); // Si l'utilisateur modifie après avoir "complété"
  };

  const handleMarkAsDone = () => {
    // Ici, on pourrait sauvegarder entryText quelque part si saveOption était true
    // (ex: dans un état parent, localStorage, ou envoyer à une API de journalisation)
    console.log("Texte du journal (pour cette activité):", entryText);
    setIsCompleted(true);
    // onComplete(); // Appeler onComplete pour passer à l'activité suivante
    // Pour ce type d'exercice, on peut laisser l'utilisateur cliquer sur "Suivant"
    // sur la page principale du programme une fois qu'il a fini d'écrire.
    // Si tu veux un bouton "Terminé" spécifique à cet exercice qui appelle onComplete :
    // décommente la ligne ci-dessus et le bouton ci-dessous.
  };


  return (
    <div className="journaling-exercise-activity">
      {/* Le titre et la description générale sont déjà affichés par StressProgramPage */}
      {/* <h3 className="activity-subtitle">{title}</h3> */}
      
      <div className="journaling-prompt-container">
        <Edit3 size={28} className="prompt-icon" />
        <p className="journaling-prompt">{prompt}</p>
      </div>

      <textarea
        className="journaling-textarea"
        placeholder={placeholder}
        value={entryText}
        onChange={handleTextChange}
        rows="8" // Un nombre de lignes conséquent par défaut
        aria-label="Zone de texte pour votre entrée de journal"
      />

      {/* Optionnel: Bouton pour marquer comme "fait" ou "sauvegarder" cette entrée spécifique */}
      {/* Cela dépend si tu veux que l'utilisateur valide explicitement cette étape */}
      {/* <div className="journaling-actions">
        <button 
          className={`btn btn--journal-done ${isCompleted ? 'completed' : ''}`}
          onClick={handleMarkAsDone}
          disabled={!entryText.trim()} // Désactivé si le textarea est vide
        >
          <CheckSquare size={18} /> {isCompleted ? "Noté !" : "J'ai noté mes pensées"}
        </button>
      </div> */}
      <p className="journaling-tip">
        Prends ton temps, il n'y a pas de bonne ou mauvaise façon d'écrire. L'important est de laisser tes pensées s'exprimer.
      </p>
    </div>
  );
};

export default JournalingExercise;