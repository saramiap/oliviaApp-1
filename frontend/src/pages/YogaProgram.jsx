// src/pages/YogaProgramPage.js
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // useParams si tu as des URL par jour
import { yogaProgram } from '../data/YogaProgramData';
import '../styles/_yogaProgram.scss'; // Nouveau fichier SCSS
import { PlayCircle, ChevronLeft, ListChecks } from 'lucide-react';

// Un composant pour afficher le lecteur vidéo (YouTube, Vimeo ou local)
const VideoPlayer = ({ videoId, videoType }) => {
  if (videoType === 'youtube') {
    return (
      <div className="video-responsive-wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} // autoplay=1 pour lancer auto, rel=0 pour moins de suggestions
          title="Yoga Session Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  } else if (videoType === 'vimeo') {
    return (
      <div className="video-responsive-wrapper">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
          title="Yoga Session Video Player"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  } else if (videoType === 'local') {
    return (
      <div className="video-responsive-wrapper">
        <video controls autoPlay src={videoId} width="100%">
          Désolé, votre navigateur ne supporte pas les vidéos intégrées.
        </video>
      </div>
    );
  }
  return <p>Type de vidéo non supporté.</p>;
};


const YogaProgram = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  // Pour un programme de 7 jours, on peut se baser sur la première semaine
  const currentWeek = yogaProgram.weeks[0]; 
const navigate = useNavigate();

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    // Faire défiler vers le haut de la page ou vers le lecteur vidéo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSelectedSession = () => {
    setSelectedSession(null);
  }

  if (!currentWeek) {
    return <p>Programme de yoga non trouvé.</p>;
  }
 const navigateToDetente = () => {
    
    navigate('/detente'); // Navigue vers la page principale de détente
  };
  return (
    <div className="yoga-program-page">
      <header className="yoga-program-header">
             {/* --- NOUVEAU BOUTON RETOUR --- */}
            <div className="theme-selection-header"> {/* Wrapper pour le bouton et le titre */}
              <button 
                className="btn btn--back-to-detente" // Classe spécifique pour ce bouton
                onClick={navigateToDetente} 
                title="Retour à l'Espace Détente"
              >
                  <ChevronLeft size={20} /> <span>Retour à l'espace Détente</span>
              </button>
            </div>
        <ListChecks size={40} className="program-icon" />
        <h1>{yogaProgram.title}</h1>
        <p className="program-description">{yogaProgram.description}</p>
      </header>

      {selectedSession ? (
        <section className="yoga-session-player-view">
          <button onClick={clearSelectedSession} className="btn btn--back-to-program">
            <ChevronLeft size={20}/> Retour à la liste des séances
          </button>
          <h2 className="current-session-title">{selectedSession.day}. {selectedSession.title}</h2>
          <p className="current-session-focus"><span>Focus :</span> {selectedSession.focus}</p>
          <p className="current-session-duration"><span>Durée :</span> ~{selectedSession.duration}</p>
          
          <VideoPlayer videoId={selectedSession.videoId} videoType={selectedSession.videoType} />
          
          <div className="current-session-details card-style">
            <h3>Description de la séance :</h3>
            <p>{selectedSession.description}</p>
            {selectedSession.keyPostures && selectedSession.keyPostures.length > 0 && (
              <>
                <h4>Postures clés abordées :</h4>
                <ul>
                  {selectedSession.keyPostures.map((posture, idx) => <li key={idx}>{posture}</li>)}
                </ul>
              </>
            )}
          </div>
           <button onClick={clearSelectedSession} className="btn btn--back-to-program btn--bottom">
            <ChevronLeft size={20}/> Retour à la liste des séances
          </button>
        </section>
      ) : (
        <section className="yoga-sessions-list">
          <h2>{currentWeek.title} - Programme des Séances</h2>
          <div className="sessions-grid">
            {currentWeek.sessions.map((session) => (
              <article 
                key={session.id} 
                className="session-card" 
                onClick={() => handleSessionSelect(session)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSessionSelect(session);}}
              >
                <div className="session-card-header">
                    <span className="session-day">Jour {session.day}</span>
                    <span className="session-duration">{session.duration}</span>
                </div>
                <h3 className="session-title">{session.title}</h3>
                <p className="session-focus">{session.focus}</p>
                <button className="btn btn--select-session">
                  <PlayCircle size={18}/> Commencer la séance
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default YogaProgram;