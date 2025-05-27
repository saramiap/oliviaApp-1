// src/components/StressProgramActivities/CoherenceCardiac.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/_coherenceCardiac.scss'; // Crée ce fichier SCSS
import { PlayCircle, PauseCircle, RotateCcw } from 'lucide-react'; // Icônes

const CoherenceCardiac = ({ title, description, params, onComplete }) => {
  const { duration, breathsPerMinute = 6 } = params; // breathsPerMinute par défaut à 6 (5s inspire, 5s expire)
  
  const cycleDuration = 60 / breathsPerMinute; // Durée d'un cycle complet (inspire + expire) en secondes
  const phaseDuration = cycleDuration / 2; // Durée d'une phase (inspire OU expire)

  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inspire'); // 'inspire' ou 'expire'
  const [showInstructions, setShowInstructions] = useState(true);

  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);

  const resetExercise = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
    setCurrentPhase('inspire');
    setShowInstructions(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
  }, [duration]);

  // Gère le décompte principal de l'exercice
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setCurrentPhase('finished');
      // onComplete(); // Appeler onComplete quand l'exercice est terminé
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, onComplete]);

  // Gère l'alternance des phases inspire/expire
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Démarre la première phase immédiatement
      setCurrentPhase('inspire'); 
      phaseTimerRef.current = setInterval(() => {
        setCurrentPhase(prevPhase => prevPhase === 'inspire' ? 'expire' : 'inspire');
      }, phaseDuration * 1000); // Convertir en millisecondes
    } else {
      clearInterval(phaseTimerRef.current);
      if (timeLeft === 0) setCurrentPhase('finished'); // S'assurer que la phase est bien 'finished'
    }
    return () => clearInterval(phaseTimerRef.current);
  }, [isRunning, timeLeft, phaseDuration]);


  const handleStartPause = () => {
    if (showInstructions) setShowInstructions(false);
    if (timeLeft === 0) { // Si terminé, et on clique sur "Recommencer" (qui devient le bouton start/pause)
        resetExercise();
        // On ne lance pas directement, l'utilisateur doit cliquer à nouveau pour démarrer
        // setIsRunning(true); // Décommente si tu veux que "Recommencer" lance aussi
        return;
    }
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="coherence-cardiac-activity">
      {showInstructions && (
        <div className="instructions-panel">
          <h4>Instructions pour la {title} :</h4>
          <p>{description}</p>
          <ul>
            <li>Installe-toi confortablement, le dos droit mais détendu.</li>
            <li>Essaie de respirer calmement par le nez.</li>
            <li>Synchronise ton inspiration et ton expiration avec le guide visuel.</li>
            <li>L'objectif est d'atteindre environ {breathsPerMinute} respirations par minute.</li>
          </ul>
          <button className="btn btn--start-exercise" onClick={handleStartPause}>
            Commencer ({formatTime(duration)})
          </button>
        </div>
      )}

      {!showInstructions && (
        <div className="exercise-panel">
          <div className="coherence-visualizer"  style={{ '--phase-duration': phaseDuration }}>
            <div className={`visualizer-shape phase--${currentPhase} ${isRunning ? 'running' : 'paused'}`}>
              
            </div>
            <span className="phase-label">
              {currentPhase === 'inspire' && isRunning && "Inspirez"}
              {currentPhase === 'expire' && isRunning && "Expirez"}
              {currentPhase === 'finished' && "Terminé !"}
              {!isRunning && currentPhase !== 'finished' && "En pause"}
            </span>
          </div>

          <div className="timer-display">
            Temps restant : {formatTime(timeLeft)}
          </div>
          
          <div className="controls">
            <button onClick={handleStartPause} className="btn btn--control">
              {timeLeft === 0 ? <RotateCcw size={20}/> : (isRunning ? <PauseCircle size={20} /> : <PlayCircle size={20} />)}
              <span>{timeLeft === 0 ? "Recommencer" : (isRunning ? "Pause" : "Reprendre")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoherenceCardiac;