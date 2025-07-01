// src/components/ConstructionPage.js (tu peux le mettre dans components ou pages)
import React from 'react';
import { Mic } from 'lucide-react'; // Icône de micro
import '../styles/_constructionPage.scss'; // On va créer ce fichier SCSS

const ConstructionPage = ({ 
  pageName = "Contenu", 
  featureDescription = "de nouvelles fonctionnalités incroyables",
  IconComponent = HardHat // Icône par défaut si aucune n'est fournie
}) => {
  return (
    <div className="construction-page">
      <div className="construction-content">
        <div className="icon-animation-container">
          {/* Affiche l'icône passée en prop */}
          <IconComponent size={64} className="dynamic-icon" />
        </div>
        <h1>La Section {pageName} Arrive Bientôt !</h1>
        <p>
          Nous travaillons actuellement à la préparation {featureDescription}. 
          Revenez un peu plus tard pour découvrir notre sélection.
        </p>
        <p className="thank-you-message">
          Merci pour votre patience et votre enthousiasme !
        </p>
      </div>
    </div>
  );
};

export default ConstructionPage;