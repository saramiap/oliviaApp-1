// src/components/StressProgramActivities/SupportSuggestion.js
import React from 'react';
import { Link } from 'react-router-dom'; // Pour le lien vers la page d'urgence
import '../../styles/_supportSuggestion.scss'; // Crée ce fichier SCSS
import { LifeBuoy, ExternalLink } from 'lucide-react'; // Icônes

const SupportSuggestion = ({ title, description, params, onComplete }) => {
  const { 
    message = "Il est courageux de reconnaître quand on a besoin d'aide. N'hésite pas à chercher du soutien.", // Message par défaut
    emergencyPageRoute = "/urgence" // Route par défaut
  } = params;

  // Pour cette activité, "onComplete" sera appelé par le bouton "Suivant" global
  // de StressProgramPage après que l'utilisateur a lu les informations.
  // Il n'y a pas d'action spécifique à valider dans ce composant.

  return (
    <div className="support-suggestion-activity">
      {/* Le titre général est déjà affiché par StressProgramPage */}
      {/* <h3 className="activity-subtitle">{title}</h3> */}
      
      <div className="support-message-container">
        <LifeBuoy size={40} className="support-icon" />
        <p className="support-text-main">{description}</p> {/* Utilisation de la description de l'activité */}
        {message && <p className="support-text-additional">{message}</p>}
      </div>

      <div className="support-actions">
        <Link to={emergencyPageRoute} className="btn btn--emergency-link">
          Voir les ressources d'aide <ExternalLink size={16} />
        </Link>
        {/* Tu pourrais ajouter d'autres liens directs ici si pertinent */}
        {/* Exemple:
        <a href="tel:3114" className="btn btn--direct-call">
          Appeler le 3114 (Prévention Suicide) <PhoneCall size={16} />
        </a> 
        */}
      </div>

      <p className="support-reminder">
        Prendre soin de ta santé mentale est essentiel. Tu n'es pas seul·e.
      </p>
    </div>
  );
};

export default SupportSuggestion;