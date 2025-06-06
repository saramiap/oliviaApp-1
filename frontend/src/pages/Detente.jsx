import React from "react";
import { useNavigate } from "react-router-dom";


const themes = [
  {
    title: "Programme anti-stress (7 jours)",
    description: "Un parcours personnalisé pour mieux gérer ton stress au quotidien.",
    image: "../../public/antiStress.jpg", // Assure-toi que cette image existe
    route: "/detente/programme", // Le nouveau chemin de ta route
  },
  {
    id: 'voyage-sonore', // Nouvel id
    title: "Voyages Sonores Immersifs", // Nouveau titre
    description: "Laisse-toi transporter par des ambiances sonores apaisantes et personnalisées.", // Nouvelle description
    image: "../../public/voyage-immersif.jpg", // Tu auras besoin d'une image pour cela
    route: "/detente/voyage-sonore", // <<<< NOUVELLE ROUTE VERS SoundJourneyPage
  },
  {
    title: "Yoga",
    description: "Découvre des exercices de yoga.",
    image: "../../public/soundJourneyImage/yoga.jpg",
    route: "/detente/programme-yoga",
  },
  {
    title: "Pourquoi le stress nous bloque",
    description: "Comprendre les mécanismes du stress pour mieux l'apprivoiser.",
    image: "../../public/stress.jpg",
    route: "/detente/comprendre-stress",
  },
 // {
   // title: "Se dépasser en respirant",
    //description: "Utilise ta respiration pour dépasser tes blocages intérieurs.",
    //image: "/images/depasser.jpg",
   // route: "/detente/depasser",
  //},
];

const Detente = () => {
  const navigate = useNavigate();

  return (
    <div className="detente">
      <header className="detente__header"> {/* Ajout d'un header pour le titre et l'intro */}
        <h1>🌿 Espace de Détente</h1>
        <p className="detente__intro">
          Respire profondément, accorde-toi un moment. Choisis une expérience pour te relaxer et te recentrer :
        </p>
      </header>
      <div className="detente__cards-grid"> {/* Renommé pour plus de clarté si tu utilises grid */}
        {themes.map((theme) => ( // Utilisation de theme.id pour la clé
          <div
            key={theme.id} 
            className="detente__card"
            onClick={() => navigate(theme.route)}
            role="button" // Pour l'accessibilité
            tabIndex={0} // Pour la navigation au clavier
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(theme.route);}} // Pour l'accessibilité
          >
            <div className="detente__card-image-wrapper">
              <img src={theme.image} alt="" className="detente__card-image" /> {/* alt="" si l'image est purement décorative et que le titre suffit */}
            </div>
            <div className="detente__card-content">
              <h3 className="detente__card-title">{theme.title}</h3>
              <p className="detente__card-description">{theme.description}</p>
            </div>
            <div className="detente__card-action">
                <span>Explorer</span> {/* Un petit texte d'action */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default Detente;
