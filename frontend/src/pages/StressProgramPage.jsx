import React, { useState, useEffect } from 'react';
import '../styles/_stressProgram.scss';
import { useNavigate } from 'react-router-dom'; // Si tu veux un bouton "Retour à Détente"
import { Zap, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react'; 
import BreathingExercise from '../components/StressProgramActivites/BreathingExercise';
import QuoteDisplay from '../components/StressProgramActivites/QuoteDisplay';
import CoherenceCardiac from '../components/StressProgramActivites/CoherenceCardiac';
import JournalingExercise from '../components/StressProgramActivites/JournalingExercise';
import Grounding54321 from '../components/StressProgramActivites/Grounding54321';
import SupportSuggestion from '../components/StressProgramActivites/SupportSuggestion';


const stressLevels = {
    low: {
      title: 'Stress léger',
      description: 'Tu ressens une petite tension ou agitation. Ces exercices doux t\'aideront à te recentrer.',
      activities: [
        {
          id: 'low_breath_478',
          type: 'breathing', // Type d'activité
          componentType: 'BreathingExercise', // Nom du composant React à rendre
          title: 'Respiration 4-7-8',
          description: 'Une technique simple pour calmer rapidement le système nerveux. Inspire par le nez, expire par la bouche.',
          params: { // Paramètres spécifiques à cet exercice de respiration
            cycles: 3, // Nombre de cycles à faire
            inspire: 4, // Secondes
            hold: 7,    // Secondes
            expire: 8,  // Secondes
            instructions: [
              "Installe-toi confortablement, assise ou allongée.",
              "Ferme doucement les yeux si tu le souhaites.",
              "Expire complètement par la bouche en faisant un léger son \"whoosh\".",
              "Ferme la bouche et inspire calmement par le nez en comptant mentalement jusqu'à 4.",
              "Retiens ta respiration en comptant jusqu'à 7.",
              "Expire bruyamment par la bouche en comptant jusqu'à 8.",
              "Ceci est un cycle. Recommence pour le nombre de cycles indiqué."
            ]
          }
        },
        {
            id: 'low_quote',
            type: 'reading',
            componentType: 'QuoteDisplay', // <-- Important
            title: 'Pensée Inspirante',
            description: 'Laisse cette citation résonner en toi.',
            params: {
              quote: '"Chaque nouvelle aube est une nouvelle chance de respirer profondément, de recommencer et de se sentir vivant."',
              author: 'Oprah Winfrey (adapté)'
            }
          },
      ],
    },
    moderate: {
      title: 'Stress modéré',
      description: 'Tu te sens un peu dépassé(e). Ces outils t\'aideront à reprendre pied et à clarifier tes pensées.',
      activities: [
        {
            id: 'mod_coherence',
            type: 'breathing',
            componentType: 'CoherenceCardiac', // <-- Important
            title: 'Cohérence Cardiaque (3 min)',
            description: 'Synchronise ta respiration avec une animation visuelle pour harmoniser ton rythme cardiaque et apaiser ton système nerveux.',
            params: {
              duration: 180, // 3 minutes en secondes
              breathsPerMinute: 6, // 5s inspire, 5s expire
            }
          },
          {
            id: 'mod_journal',
            type: 'writing',
            componentType: 'JournalingExercise', // <-- Important
            title: 'Journal de pensées structuré',
            description: 'Mettre des mots sur tes pensées peut t\'aider à prendre du recul et à trouver des solutions.',
            params: {
              prompt: "Prends un instant pour écrire librement ce qui te pèse en ce moment. Quelles sont les pensées ou situations qui génèrent ce stress modéré ? Essaie ensuite de trouver une petite action que tu pourrais entreprendre pour alléger l'une de ces sources de tension.",
              placeholder: "Écris ici tes pensées, tes préoccupations, tes idées...",
              // saveOption: false // Pour l'instant, on ne gère pas la sauvegarde active
            }
          },
      ],
    },
    high: {
      title: 'Stress élevé',
      description: 'Tu es probablement surchargé(e). Ces techniques sont conçues pour t\'aider à t\'ancrer dans le présent et à envisager un soutien.',
      activities: [
        {
            id: 'high_grounding_54321',
            type: 'grounding',
            componentType: 'Grounding54321', // <-- Important
            title: 'Exercice d\'ancrage 5-4-3-2-1',
            description: 'Cette technique t\'aide à te reconnecter à tes sens et à l\'instant présent lorsque tout semble trop intense.',
            params: {
              steps: [
                { sense: "VOIR", instruction: "Regarde autour de toi et nomme 5 choses distinctes que tu peux voir. Prends le temps de vraiment les observer.", count: 5 },
                { sense: "TOUCHER", instruction: "Prends conscience de 4 choses que tu peux sentir au toucher. Cela peut être la texture de tes vêtements, la surface de la chaise, la température de l'air...", count: 4 },
                { sense: "ENTENDRE", instruction: "Prête attention et identifie 3 sons différents. Qu'ils soient proches ou lointains, doux ou forts.", count: 3 },
                { sense: "SENTIR (Odorat)", instruction: "Concentre-toi sur ton odorat et essaie de percevoir 2 odeurs différentes dans ton environnement.", count: 2 },
                { sense: "GOÛTER", instruction: "Prends conscience d'1 chose que tu peux goûter. Cela peut être le goût résiduel de ton dernier repas, ou simplement la sensation dans ta bouche.", count: 1 }
              ]
            }
          },
          {
            id: 'high_support',
            type: 'support',
            componentType: 'SupportSuggestion', // <-- Important
            title: 'Envisager un Soutien Extérieur', // Ce titre sera affiché par StressProgramPage
            description: 'Lorsque le stress est élevé et persistant, il est important de ne pas rester seul·e. Parler à un professionnel peut faire une grande différence.', // Description de l'activité
            params: {
              message: "Tu peux consulter notre page de ressources d'urgence pour trouver des contacts utiles ou parler à une personne de confiance.", // Message spécifique à cette étape
              emergencyPageRoute: "/urgence" // Lien vers ta page d'urgence
            }
          },
      ],
    },
  };
  
  const activityComponents = {
    BreathingExercise,
    QuoteDisplay,
    CoherenceCardiac,
    JournalingExercise,
    Grounding54321,
    SupportSuggestion,
    // Ajoute d'autres types de composants ici
  };
  

const StressProgramPage = () => {
    console.log("StressProgramPage loaded");

  const [stressLevel, setStressLevel] = useState('');
  const [currentStep, setCurrentStep] = useState(0);// Index de l'activité pour le niveau de stress choisi
  const currentProgram = stressLevels[stressLevel];

  const navigate = useNavigate();
  const handleLevelChange = (level) => {
    setStressLevel(level);
    setCurrentStep(0); // Réinitialise à la première activité du niveau
  };

  // Les activités pour le niveau de stress sélectionné
  const currentActivities = stressLevels[stressLevel]?.activities || [];
  const currentActivity = currentActivities[currentStep];
  const currentActivityData = currentActivities[currentStep];

  // Fonction pour passer à l'activité suivante (appelée par les sous-composants)
  const handleCompleteActivity = () => {
    if (currentStep < currentActivities.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Toutes les activités du niveau sont terminées
      // Tu pourrais afficher un message de félicitations ici
      setCurrentStep(currentActivities.length); // Un état pour indiquer la fin
    }
  };
  
  const renderActivity = () => {
    if (!currentActivityData) return null;
  
    const ActivityComponent = activityComponents[currentActivityData.componentType];
    if (!ActivityComponent) {
      return <p>Erreur: Type d'activité inconnu ({currentActivityData.componentType})</p>;
    }
  

return (
    <ActivityComponent
      title={currentActivityData.title}
      description={currentActivityData.description}
      params={currentActivityData.params}
      onComplete={handleCompleteActivity} // Passe la fonction pour que l'activité puisse signaler sa complétion
    />
  );
};
  const navigateToDetente = () => {  
    navigate('/detente'); // Navigue vers la page principale de détente
  };

  return (
    <div className="stress-program-page"> {/* Renommé pour être plus spécifique que .stress-program */}
      <div className="stress-program-container"> {/* Wrapper pour centrer et limiter la largeur */}
        <header className="stress-program-header">
                  {/* --- NOUVEAU BOUTON RETOUR --- */}
            <div className="theme-selection-header"> {/* Wrapper pour le bouton et le titre */}
              <button 
                className="btn btn--back-to-detente" // Classe spécifique pour ce bouton
                onClick={navigateToDetente} 
                title="Retour à l'Espace Détente"
              >
                  <ChevronLeft size={20} /> <span>Retour à Détente</span>
              </button>
             
            </div>
          <Zap size={36} className="header-icon" /> {/* Icône thématique */}
          <h1>Mon Programme Anti-Stress</h1>
          <p className="program-subtitle">
            Un accompagnement personnalisé pour retrouver calme et sérénité.
          </p>
        </header>

        {!stressLevel && (
          <section className="stress-level-selection card-style">
            <h2>Comment te sens-tu aujourd'hui ?</h2>
            <p>Choisis le niveau qui correspond le mieux à ton état actuel pour commencer.</p>
            <div className="stress-level-buttons">
              <button className="btn btn--low" onClick={() => handleLevelChange('low')}>
                Stress Léger
              </button>
              <button className="btn btn--moderate" onClick={() => handleLevelChange('moderate')}>
                Stress Modéré
              </button>
              <button className="btn btn--high" onClick={() => handleLevelChange('high')}>
                Stress Élevé
              </button>
            </div>
          </section>
        )}

{stressLevel && currentProgram && (
          <section className="stress-activity-display">
            {currentStep < currentActivities.length ? ( // Si on a encore des activités
              <>
                <div className="activity-header card-style">
                  <h2>{currentProgram.title}</h2>
                  <p className="level-description">{currentProgram.description}</p>
                </div>

                <article className="activity-content card-style">
                  {/* Affiche le composant d'activité dynamique */}
                  {renderActivity()}
                </article>

                <nav className="activity-navigation">
                  <button
                    className="btn btn--nav"
                    onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft size={20} /> Précédent
                  </button>
                  <span className="activity-step-indicator">
                    {currentActivities.length > 0 ? `Activité ${currentStep + 1} / ${currentActivities.length}` : 'Chargement...'}
                  </span>
                  <button
                    className="btn btn--nav"
                    onClick={handleCompleteActivity} // Utilise handleCompleteActivity pour passer à la suivante
                    disabled={currentStep >= currentActivities.length -1 && currentActivities.length > 0} // Désactivé sur la dernière activité
                  >
                    Suivant <ChevronRight size={20} />
                  </button>
                </nav>
              </>
            ) : ( // Toutes les activités sont terminées pour ce niveau
              <div className="completion-message card-style">
                <h3>Bravo ! ✨</h3>
                <p>Tu as terminé toutes les activités pour le niveau "{currentProgram.title}".</p>
                <p>Prends un moment pour apprécier cet accomplissement. N'hésite pas à revenir à ce programme quand tu en ressens le besoin.</p>
              </div>
            )}

            <button
              className="btn btn--restart"
              onClick={() => setStressLevel('')}
            >
              <RefreshCcw size={16} /> Changer de niveau / Recommencer
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default StressProgramPage;
