// src/components/StressProgramActivities/Grounding54321.js
import React, { useState } from 'react';
import '../../styles/_grounding54321.scss'; // Crée ce fichier SCSS
import { Eye, Ear, Hand, Sprout, Utensils, CheckCircle } from 'lucide-react'; // Icônes pour chaque sens

const SenseIcon = ({ sense }) => {
  switch (sense.toUpperCase()) {
    case 'VOIR': return <Eye size={28} />;
    case 'TOUCHER': return <Hand size={28} />;
    case 'ENTENDRE': return <Ear size={28} />;
    case 'SENTIR (ODORAT)': return <Sprout size={28} />; // ou Wind, Smile...
    case 'GOÛTER': return <Utensils size={28} />; // ou Coffee, Apple...
    default: return null;
  }
};

const Grounding54321 = ({ title, description, params, onComplete }) => {
  const { steps } = params; // steps est un tableau d'objets { sense, instruction, count }
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false); // Pour savoir si l'étape actuelle est "validée" par l'utilisateur

  const currentStepData = steps[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      setIsStepCompleted(false); // Réinitialise pour la nouvelle étape
    } else {
      // Toutes les étapes sont terminées
      // onComplete(); // Le bouton "Suivant" global de StressProgramPage s'en chargera
      // Ou tu peux afficher un message de fin ici et un bouton pour appeler onComplete
    }
  };

  // Pour cet exercice, le "onComplete" sera géré par le bouton "Suivant"
  // de la page StressProgramPage une fois que l'utilisateur aura parcouru toutes les étapes.
  // Si tu voulais un bouton "Terminer l'exercice" à la fin des 5 étapes :
  // const handleFinishExercise = () => {
  //   onComplete();
  // };

  if (!currentStepData) {
    // Cela peut arriver si currentStepIndex >= steps.length (fin du programme)
    // StressProgramPage devrait gérer l'affichage du message de fin de niveau.
    return (
        <div className="grounding-exercise-activity grounding-finished">
            <CheckCircle size={48} className="completion-icon" />
            <h4>Excellent !</h4>
            <p>Vous avez complété l'exercice d'ancrage 5-4-3-2-1.</p>
            <p>Prenez un instant pour remarquer comment vous vous sentez.</p>
            {/* Bouton optionnel pour explicitement finir l'activité */}
            {/* <button className="btn btn--next-activity" onClick={onComplete}>Activité suivante</button> */}
        </div>
    );
  }

  return (
    <div className="grounding-exercise-activity">
      {/* <h3 className="activity-subtitle">{title}</h3> Le titre est dans StressProgramPage */}
      {/* <p className="activity-step-description">{description}</p> Idem pour la description générale */}

      <div className="grounding-step-card">
        <div className="step-header">
          <span className="step-icon"><SenseIcon sense={currentStepData.sense} /></span>
          <h4 className="step-sense-title">{currentStepData.count} Chose(s) à {currentStepData.sense.toLowerCase()}</h4>
        </div>
        <p className="step-instruction">{currentStepData.instruction}</p>
        
        {/* Optionnel: input ou checkboxes si tu veux que l'utilisateur liste les choses */}
        {/* Pour la simplicité, on va juste avoir un bouton "Fait" ou "Suivant" */}

        {!isStepCompleted ? (
            <button 
                className="btn btn--step-done" 
                onClick={() => setIsStepCompleted(true)} // Marque l'étape comme "mentalement faite"
            >
                J'ai identifié les {currentStepData.count} élément(s)
            </button>
        ) : (
            <div className="step-confirmation">
                <CheckCircle size={20} className="confirmation-icon"/> 
                Bien ! Passons à la suite.
            </div>
        )}
      </div>

      {/* La navigation entre les étapes de l'exercice 5-4-3-2-1 est implicite
          car le bouton "Suivant" de StressProgramPage fera avancer currentStep
          dans StressProgramPage, ce qui re-rendra ce composant avec currentStepData mis à jour.
          Si tu veux des boutons Précédent/Suivant *dans* cet exercice :
      */}
       <div className="grounding-navigation">
         <button
           className="btn btn--nav-grounding"
           onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
           disabled={currentStepIndex === 0}
         >
           Étape Précédente
         </button>
         <span className="grounding-step-indicator">
            Étape {currentStepIndex + 1} / {steps.length}
         </span>
         <button
           className="btn btn--nav-grounding"
           onClick={handleNextStep}
           disabled={currentStepIndex >= steps.length -1} // Désactivé sur la dernière étape
         >
           Étape Suivante
         </button>
       </div>
    </div>
  );
};

export default Grounding54321;