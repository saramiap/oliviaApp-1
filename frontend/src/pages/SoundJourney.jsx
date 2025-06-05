// src/pages/SoundJourneyPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Si cette page est accessible directement par une route
import { soundJourneyThemes } from '../components/SoundJourneyThemes';
import { Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';
import '../styles/SoundJourney.scss'


// Hook simple pour gérer plusieurs pistes audio
const useAudioPlayer = (tracks = []) => {
  const audioElementsRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audioElementsRef.current = tracks.map(track => new Audio(track.src));
    tracks.forEach((track, index) => {
      const audio = audioElementsRef.current[index];
      audio.loop = track.loop || false;
      audio.volume = isMuted ? 0 : (track.volume || 1);
    });

    return () => { // Cleanup
      audioElementsRef.current.forEach(audio => {
        audio.pause();
        audio.src = ''; // Libérer les ressources
      });
      audioElementsRef.current = [];
    };
  }, [tracks, isMuted]); // Recrée les éléments si les pistes changent ou si on mute/demute

  const play = () => {
    audioElementsRef.current.forEach((audio, index) => {
      // Gérer le délai si spécifié
      const delay = tracks[index].delay || 0;
      setTimeout(() => {
        audio.play().catch(e => console.error("Erreur lecture audio:", e));
      }, delay);
    });
    setIsPlaying(true);
  };

  const pause = () => {
    audioElementsRef.current.forEach(audio => audio.pause());
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) pause();
    else play();
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    audioElementsRef.current.forEach((audio, index) => {
      audio.volume = newMutedState ? 0 : (tracks[index].volume || 1);
    });
    setIsMuted(newMutedState);
  };
  
  // Fonction pour arrêter tous les sons et réinitialiser
  const stopAndReset = () => {
    pause();
    audioElementsRef.current.forEach(audio => {
        audio.currentTime = 0; // Rembobine
    });
  };


  return { isPlaying, togglePlayPause, isMuted, toggleMute, stopAndReset };
};


const SoundJourney = () => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [showOutro, setShowOutro] = useState(false);
  const { 
    isPlaying, 
    togglePlayPause, 
    isMuted, 
    toggleMute, 
    stopAndReset 
  } = useAudioPlayer(selectedTheme ? selectedTheme.audioTracks : []);

  const navigate = useNavigate(); // Si tu veux un bouton "Quitter"

  useEffect(() => {
    // Arrêter les sons si le composant est démonté ou si le thème change
    return () => {
      if(stopAndReset) stopAndReset();
    };
  }, [selectedTheme, stopAndReset]);

  const handleThemeSelect = (theme) => {
    if (selectedTheme && isPlaying) {
      stopAndReset(); // Arrête et réinitialise les sons du thème précédent
    }
    setSelectedTheme(theme);
    setShowIntro(true); // Montre l'intro d'Olivia
    setShowOutro(false);
    // La lecture commencera après que l'utilisateur ait cliqué "Commencer" dans l'intro
  };
  
  const startJourney = () => {
    setShowIntro(false);
    togglePlayPause(); // Devrait démarrer la lecture
  };

  const endJourney = () => {
      togglePlayPause(); // Met en pause
      setShowOutro(true);
      // Optionnel: après quelques secondes, réinitialiser la page
      // setTimeout(() => {
      //    setSelectedTheme(null);
      //    setShowOutro(false);
      // }, 5000);
  };
  
  const quitJourney = () => {
    if (isPlaying) stopAndReset();
    setSelectedTheme(null);
    setShowIntro(false);
    setShowOutro(false);
    // navigate('/detente'); // Retourne à la page de sélection des thèmes de détente
  }

  return (
    <div 
        className="sound-journey-page" 
        style={{ backgroundImage: selectedTheme ? `url(${selectedTheme.backgroundImage})` : 'none' }}
    >
      <div className="sound-journey-overlay"> {/* Pour assombrir l'image de fond et améliorer lisibilité texte */}
        
        {!selectedTheme && (
          <section className="theme-selection-section">
            <h2>Choisissez votre Voyage Sonore</h2>
            <div className="themes-grid">
              {soundJourneyThemes.map(theme => (
                <button key={theme.id} className="theme-card" onClick={() => handleThemeSelect(theme)}>
                  <img src={theme.backgroundImage} alt={theme.title} className="theme-card-image" />
                  <div className="theme-card-content">
                    <h3>{theme.title}</h3>
                    <p>{theme.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedTheme && showIntro && (
          <div className="journey-message intro-message card-style-messages">
            <p>{selectedTheme.oliviaIntro}</p>
            <button className="btn btn--start-journey" onClick={startJourney}>Commencer le voyage</button>
            <button className="btn btn--cancel-journey" onClick={quitJourney}>Choisir un autre thème</button>
          </div>
        )}
        
        {selectedTheme && !showIntro && !showOutro && (
          <div className="player-controls-container">
            <h2 className="current-theme-title">{selectedTheme.title}</h2>
            {/* Tu pourrais ajouter une barre de progression simple ici si tu gères la durée */}
            <div className="player-buttons">
              <button onClick={togglePlayPause} className="btn btn--control" title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button onClick={toggleMute} className="btn btn--control" title={isMuted ? "Activer le son" : "Couper le son"}>
                {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
              </button>
              <button onClick={endJourney} className="btn btn--control btn--stop-journey" title="Terminer le voyage">
                <SkipForward size={28} /> <span>Terminer</span>
              </button>
            </div>
          </div>
        )}

        {selectedTheme && showOutro && (
          <div className="journey-message outro-message card-style-messages">
            <p>{selectedTheme.oliviaOutro}</p>
            <button className="btn btn--restart-journey" onClick={startJourney}>Recommencer ce voyage</button>
            <button className="btn btn--cancel-journey" onClick={quitJourney}>Explorer d'autres voyages</button>
          </div>
        )}
         {/* Bouton global pour quitter si un thème est sélectionné */}
        {selectedTheme && (!showIntro && !showOutro) && (
             <button className="btn btn--quit-global" onClick={quitJourney}>Quitter le voyage</button>
        )}
      </div>
    </div>
  );
};

export default SoundJourney;