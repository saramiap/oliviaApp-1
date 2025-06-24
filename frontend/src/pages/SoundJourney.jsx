// src/pages/SoundJourneyPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Si tu veux un bouton "Retour à Détente"
import { soundJourneyThemes } from '../components/SoundJourneyThemes';
import { addActivityToStorage } from '../utils/localStorageManager'; // Importe la fonction
import { Headphones } from 'lucide-react';
import { Play, Pause, Volume2, VolumeX, RefreshCcw, ChevronLeft, CheckCircle, ListMusic } from 'lucide-react';
import '../styles/_soundJourney.scss';
// Hook pour gérer plusieurs pistes audio
const useAudioPlayer = () => {
  const audioElementsRef = useRef([]); // Stocke les instances <audio>
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTracksData, setCurrentTracksData] = useState([]); // Pour garder une trace des métadonnées des pistes

  // Fonction pour initialiser ou changer les pistes
  const setupTracks = useCallback((tracksConfig = []) => {
    // 1. Nettoyer les anciennes pistes
    audioElementsRef.current.forEach(audio => {
      audio.pause();
      audio.src = ''; // Libère la ressource
    });
    audioElementsRef.current = [];
    setCurrentTracksData(tracksConfig); // Sauvegarde la config des nouvelles pistes

    // 2. Créer les nouveaux éléments audio
    audioElementsRef.current = tracksConfig.map(trackConf => {
      const audio = new Audio(trackConf.src);
      audio.loop = trackConf.loop || false;
      audio.volume = isMuted ? 0 : (trackConf.volume !== undefined ? trackConf.volume : 1);
      return audio;
    });
    setIsPlaying(false); // S'assurer que l'état de lecture est réinitialisé
  }, [isMuted]); // isMuted est une dépendance pour re-régler le volume si on change de pistes alors que c'est muté

  const play = useCallback(() => {
    if (audioElementsRef.current.length === 0) return;
    let allReadyToPlay = true;
    audioElementsRef.current.forEach((audio, index) => {
      if (audio.readyState < 2) { // Si une piste n'est pas prête (pas assez de données)
          allReadyToPlay = false;
          // Tu pourrais ajouter un indicateur de chargement ici
          audio.load(); // Tente de charger à nouveau
      }
    });

    if (!allReadyToPlay) {
        // Option: afficher un message de chargement ou attendre un peu et réessayer
        console.warn("Certaines pistes audio ne sont pas prêtes, tentative de chargement...");
        // Pour une meilleure UX, tu pourrais avoir un état de chargement ici.
        // Pour l'instant, on ne joue pas si tout n'est pas prêt.
        return;
    }

    audioElementsRef.current.forEach((audio, index) => {
      const delay = currentTracksData[index]?.delay || 0;
      setTimeout(() => {
        audio.play().catch(e => console.error(`Erreur lecture audio ${audio.src}:`, e));
      }, delay);
    });
    setIsPlaying(true);
  }, [currentTracksData]);

  const pause = useCallback(() => {
    audioElementsRef.current.forEach(audio => audio.pause());
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    audioElementsRef.current.forEach((audio, index) => {
      audio.volume = newMutedState ? 0 : (currentTracksData[index]?.volume !== undefined ? currentTracksData[index].volume : 1);
    });
    setIsMuted(newMutedState);
  }, [isMuted, currentTracksData]);

  const stopAndResetAll = useCallback(() => {
    pause();
    audioElementsRef.current.forEach(audio => {
      if (audio.src) { // Vérifie si une source est définie avant de manipuler currentTime
        try {
          audio.currentTime = 0;
        } catch (e) {
          // currentTime ne peut pas être défini si l'audio n'a pas été initialisé correctement
          // ou si la source est invalide. On ignore cette erreur pour l'instant.
          console.warn(`Impossible de réinitialiser currentTime pour ${audio.src}: ${e.message}`);
        }
      }
    });
  }, [pause]);

  return { isPlaying, togglePlayPause, isMuted, toggleMute, stopAndResetAll, setupTracks };
};


const SoundJourney = () => {
  const [pageState, setPageState] = useState('theme_selection'); // theme_selection, intro, playing, outro
  const [selectedTheme, setSelectedTheme] = useState(null);
  
  const { isPlaying, togglePlayPause, isMuted, toggleMute, stopAndResetAll, setupTracks } = useAudioPlayer();
  
  const navigate = useNavigate();

  // Gère l'arrêt des sons lors du démontage du composant ou changement de thème majeur
  useEffect(() => {
    return () => {
      stopAndResetAll();
    };
  }, [stopAndResetAll]);


  const handleThemeSelect = (theme) => {
    if (isPlaying) {
      stopAndResetAll(); // Arrête les sons du thème précédent si en cours
    }
    setSelectedTheme(theme);
 // SAUVEGARDE L'ACTIVITÉ
    addActivityToStorage({
      id: `sound_journey_${theme.id}`, // Assure un ID unique
      type: 'Voyage Sonore',
      title: theme.title,
      route: `/detente/voyage-sonore`, // Ou une route plus spécifique si tu en as une par thème
      iconName: 'Headphones' // Ou une référence à l'icône
    });

    setupTracks(theme.audioTracks); // Prépare les pistes du nouveau thème
    if (theme.oliviaIntro) {
      setPageState('intro');
    } else {
      setPageState('playing'); // Va directement à la lecture si pas d'intro
      // Pour démarrer automatiquement la lecture :
      // setTimeout(togglePlayPause, 100); // Petit délai pour assurer que setupTracks a fini
    }
  };
  
  const startJourney = () => {
    setPageState('playing');
    if (!isPlaying) { // Ne relance pas si déjà en train de jouer (ex: après un retour)
      togglePlayPause(); // Démarre la lecture
    }
  };

  const finishJourney = () => {
    if (isPlaying) {
      togglePlayPause(); // Met en pause (ou stopAndResetAll() si tu préfères tout arrêter)
    }
    if (selectedTheme && selectedTheme.oliviaOutro) {
      setPageState('outro');
    } else {
      // Si pas d'outro, retour à la sélection des thèmes
      resetToThemeSelection();
    }
  };

  const resetToThemeSelection = () => {
    stopAndResetAll();
    setSelectedTheme(null);
    setPageState('theme_selection');
  };

  const getBackgroundImage = () => {
    if ((pageState === 'intro' || pageState === 'playing' || pageState === 'outro') && selectedTheme) {
      return `url(${selectedTheme.backgroundImage})`;
    }
    return 'none'; // Pas d'image pour la sélection de thème initiale ou si aucun thème
  };

    // Nouvelle fonction pour naviguer vers la page Détente principale
  const navigateToDetente = () => {
    stopAndResetAll(); // S'assurer que tout son est arrêté avant de naviguer
    navigate('/detente'); // Navigue vers la page principale de détente
  };


  return (
    <div className="sound-journey-page" style={{ backgroundImage: getBackgroundImage() }}>
      <div className="sound-journey-overlay">
        
        {pageState === 'theme_selection' && (
          <section className="theme-selection-section">
                {/* --- NOUVEAU BOUTON RETOUR --- */}
            <div className="theme-selection-header"> {/* Wrapper pour le bouton et le titre */}
              <button 
                className="btn btn--back-to-detente" // Classe spécifique pour ce bouton
                onClick={navigateToDetente} 
                title="Retour à l'Espace Détente"
              >
                  <ChevronLeft size={20} /> <span>Retour à Détente</span>
              </button>
              <ListMusic size={48} className="page-icon theme-selection-icon" /> {/* Classe ajoutée pour le style */}
              <h2>Choisissez votre Voyage Sonore</h2>
            </div>
            <p className="page-subtitle">Plongez dans une ambiance sonore conçue pour votre bien-être.</p>
            <div className="themes-grid">
              {soundJourneyThemes.map(theme => (
                <button key={theme.id} className="theme-card" onClick={() => handleThemeSelect(theme)}>
                  <img src={theme.backgroundImage} alt="" className="theme-card-image" />
                  <div className="theme-card-content">
                    <h3>{theme.title}</h3>
                    <p>{theme.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {pageState === 'intro' && selectedTheme && (
          <div className="journey-message intro-message card-style-messages">
            <p className="olivia-text">{selectedTheme.oliviaIntro}</p>
            <button className="btn btn--start-journey" onClick={startJourney}>Commencer le voyage</button>
            <button className="btn btn--cancel-journey" onClick={resetToThemeSelection}>Choisir un autre thème</button>
          </div>
        )}
        
        {pageState === 'playing' && selectedTheme && (
          <div className="player-container">
            <button className="btn btn--back-player" onClick={resetToThemeSelection}>
                <ChevronLeft size={20} /> Autres voyages
            </button>
            <h2 className="current-theme-title-playing">{selectedTheme.title}</h2>
            <div className="player-buttons">
              <button onClick={togglePlayPause} className="btn btn--control" title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={36} /> : <Play size={36} />}
              </button>
              <button onClick={toggleMute} className="btn btn--control" title={isMuted ? "Activer le son" : "Couper le son"}>
                {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
              </button>
            </div>
            <button className="btn btn--finish-playing" onClick={finishJourney}>
                Terminer et Réfléchir
            </button>
          </div>
        )}

        {pageState === 'outro' && selectedTheme && (
          <div className="journey-message outro-message card-style-messages">
            <CheckCircle size={48} className="page-icon" />
            <h3>Voyage Terminé</h3>
            <p className="olivia-text">{selectedTheme.oliviaOutro}</p>
            <div className="outro-actions">
                <button className="btn" onClick={() => { setupTracks(selectedTheme.audioTracks); startJourney(); }}>
                  <RefreshCcw size={18}/> Recommencer ce voyage
                </button>
                <button className="btn btn--secondary" onClick={resetToThemeSelection}>
                  Explorer d'autres voyages
                </button>
                <button className="btn btn--tertiary" onClick={() => navigate('/detente')}> {/* Assure-toi que /detente est ta page principale de détente */}
                  Retour à l'Espace Détente
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundJourney;