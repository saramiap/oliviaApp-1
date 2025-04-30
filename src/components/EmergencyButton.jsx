// src/components/EmergencyButton.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const EmergencyButton = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    navigate("/urgence");
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div className="urgence-button">
        <button onClick={handleClick}>⚠ Besoin d’aide ?</button>
      </div>

      {showConfirm && (
        <div className="urgence-popup">
          <div className="urgence-popup__content">
            <p>Souhaites-tu vraiment accéder à la page d'urgence ?</p>
            <div className="urgence-popup__buttons">
              <button onClick={handleConfirm}>Oui</button>
              <button onClick={handleCancel}>Non</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;
