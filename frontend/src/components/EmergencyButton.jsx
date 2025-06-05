// src/components/EmergencyButton.jsx
import React, { useState, useEffect, useRef } from "react"; // Ajout de React pour le JSX
import ReactDOM from 'react-dom'; // <<<<<<< IMPORTATION NÉCESSAIRE
import { useNavigate } from "react-router-dom";
// import '../styles/_emergencyButton.scss'; 

// 1. DÉFINIR EmergencyPopup EN DEHORS de EmergencyButton
const EmergencyPopup = ({ onClose, onConfirm, popupRef }) => { // Ajout de popupRef en prop
  return ReactDOM.createPortal(
    <div className="urgence-popup"> {/* Cet élément reçoit le backdrop-filter */}
      <div className="urgence-popup__content" ref={popupRef}> {/* Attacher la ref ici */}
        <h2>Accès aux ressources d'urgence</h2> {/* Titre plus clair */}
        <p>
          Si vous êtes en détresse ou si vous avez besoin d'aide immédiate,
          confirmez pour être redirigé vers des ressources utiles.
        </p>
        <div className="urgence-popup__content__buttons">
          <button className="urgence-popup__button--confirm" onClick={onConfirm}>
            Oui, voir les ressources
          </button>
          <button className="urgence-popup__button--cancel" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('portal-root') // Assure-toi que cet élément existe dans ton index.html
  );
};


const EmergencyButton = () => {
  const navigate = useNavigate();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // Renommé pour clarté
  const [showTooltip, setShowTooltip] = useState(false);
  const internalPopupRef = useRef(null); // Ref pour le contenu de la popup

  const handleClickButton = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmNavigation = () => {
    setShowConfirmPopup(false);
    navigate("/urgence");
  };

  const handleCancelPopup = () => {
    setShowConfirmPopup(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // internalPopupRef.current sera le div .urgence-popup__content
      if (internalPopupRef.current && !internalPopupRef.current.contains(event.target)) {
        setShowConfirmPopup(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowConfirmPopup(false);
      }
    };

    if (showConfirmPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      // La classe page--blurred sur le body est optionnelle si backdrop-filter fait le travail.
      // Elle peut servir à empêcher le scroll du body par exemple.
      document.body.classList.add("page-content--interaction-disabled"); 
    } else {
      document.body.classList.remove("page-content--interaction-disabled");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("page-content--interaction-disabled");
    };
  }, [showConfirmPopup]);

  return (
    <div 
      className="urgence-button-wrapper" 
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button className="urgence-button" onClick={handleClickButton}>⚠</button> {/* Texte du bouton simplifié */}

      {showTooltip && !showConfirmPopup && ( // N'affiche pas le tooltip si la popup est ouverte
        <div className="urgence-tooltip">
          Accéder aux ressources d'urgence
        </div>
      )}

      {/* 3. Utiliser le composant EmergencyPopup défini à l'extérieur */}
      {showConfirmPopup && (
        <EmergencyPopup
          onClose={handleCancelPopup}
          onConfirm={handleConfirmNavigation}
          popupRef={internalPopupRef} // Passer la ref au composant Popup
        />
      )}
    </div>
  );
};

export default EmergencyButton;