// src/components/StressProgramActivities/BreathingExercise.js
import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/_breathingExercise.scss'; // Crée un SCSS dédié

const BreathingExercise = ({ title, description, params, onComplete }) => {
  const { cycles, inspire, hold, expire, instructions } = params;
  const [currentPhase, setCurrentPhase] = useState('idle'); // idle, inspire, hold, expire, finished
  const [countdown, setCountdown] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const totalPhaseTime = inspire + hold + expire;

  const startCycle = useCallback(() => {
    if (currentCycle < cycles) {
      setCurrentPhase('inspire');
      setCountdown(inspire);
    } else {
      setCurrentPhase('finished');
      // onComplete(); // Appeler onComplete quand tous les cycles sont faits
    }
  }, [currentCycle, cycles, inspire]);

  useEffect(() => {
    if (currentPhase === 'idle' || currentPhase === 'finished') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Fin d'une phase, passer à la suivante
      if (currentPhase === 'inspire') {
        setCurrentPhase('hold');
        setCountdown(hold);
      } else if (currentPhase === 'hold') {
        setCurrentPhase('expire');
        setCountdown(expire);
      } else if (currentPhase === 'expire') {
        setCurrentCycle(c => c + 1);
        // Vérifie si on doit démarrer un nouveau cycle ou si c'est fini
        if (currentCycle + 1 < cycles) {
            startCycle(); // Démarrer le prochain cycle
        } else {
            setCurrentPhase('finished');
            // onComplete(); // Optionnel: appeler onComplete ici
        }
      }
    }
  }, [countdown, currentPhase, hold, expire, currentCycle, cycles, startCycle, onComplete]);


  const handleStart = () => {
    setShowInstructions(false);
    setCurrentCycle(0); // Réinitialise les cycles
    startCycle();
  };
  
  const getPhaseText = () => {
    switch(currentPhase) {
        case 'inspire': return `Inspirez... (${countdown}s)`;
        case 'hold': return `Retenez... (${countdown}s)`;
        case 'expire': return `Expirez... (${countdown}s)`;
        case 'finished': return "Exercice terminé !";
        default: return "Prêt·e ?";
    }
  }

  return (
    <div className="breathing-exercise-activity">
      {showInstructions && (
        <div className="instructions-panel">
          <h4>Instructions pour la {title} :</h4>
          <ul>
            {instructions.map((instr, idx) => <li key={idx}>{instr}</li>)}
          </ul>
          <button className="btn btn--start-exercise" onClick={handleStart}>Commencer l'exercice ({cycles} cycles)</button>
        </div>
      )}

      {!showInstructions && (
        <div className="exercise-panel">
          <div className="breathing-visualizer">
            {/* Tu pourrais ajouter une animation SVG simple ici */}
            <div className={`visualizer-circle phase--${currentPhase}`}></div>
            <span className="phase-text">{getPhaseText()}</span>
          </div>
          {currentPhase !== 'finished' && <p className="cycle-count">Cycle : {currentCycle + 1} / {cycles}</p>}
          {currentPhase === 'finished' && (
             <button className="btn btn--restart-exercise" onClick={handleStart}>Recommencer</button>
          )}
        </div>
      )}
    </div>
  );
};

export default BreathingExercise;