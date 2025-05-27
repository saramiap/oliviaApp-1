 // src/components/StressProgramActivities/QuoteDisplay.js
import React, { useEffect } from 'react';
import '../../styles/_quoteDisplay.scss'; // Crée ce fichier SCSS
import { MessageSquareText } from 'lucide-react'; // Une icône pour la citation

const QuoteDisplay = ({ title, description, params, onComplete }) => {
  const { quote, author } = params;

   //Option 1: Marquer comme complété automatiquement après un court délai (ex: 3 secondes)
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 100000); // Marque comme complété après 3 secondes
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Option 2: L'utilisateur clique sur un bouton pour indiquer qu'il a lu (plus interactif)
  // Pour l'instant, on va considérer que l'affichage suffit et onComplete sera appelé par le bouton "Suivant" global

  return (
    <div className="quote-display-activity">
       <h3 className="activity-subtitle">{title}</h3>  Le titre est déjà affiché par StressProgramPage *
       <p className="activity-step-description">{description}</p> La description est déjà affichée par StressProgramPage *
      
      <figure className="quote-container">
        <MessageSquareText size={48} className="quote-icon" />
        <blockquote className="quote-text">
          "{quote}"
        </blockquote>
        {author && (
          <figcaption className="quote-author">
            — {author}
          </figcaption>
        )}
      </figure>

      {/* Optionnel: Bouton si tu ne veux pas que ce soit automatique */}
      <div className="quote-actions">
        <button className="btn btn--quote-read" onClick={onComplete}>
          J'ai pris un moment pour réfléchir
        </button>
      </div>
    </div>
  );
};

export default QuoteDisplay;