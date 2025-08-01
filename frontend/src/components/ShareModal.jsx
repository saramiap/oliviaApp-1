// src/components/ShareModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Mail, Link2, MessageSquare, Share2 } from 'lucide-react';
import '../styles/_shareModal.scss'; // On créera ce fichier de style

// Les "mini-pages" sélectionnables
const ShareItem = ({ title, content, isSelected, onToggle }) => {
  if (!content) return null;

  return (
    <div 
      className={`share-item ${isSelected ? 'selected' : ''}`} 
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      tabIndex="0"
      role="checkbox"
      aria-checked={isSelected}
    >
      <div className="checkbox-indicator"></div>
      <div className="share-item-preview">
        <h4>{title}</h4>
        <p>{content.substring(0, 100)}...</p>
      </div>
    </div>
  );
};

const ShareModal = ({ show, onClose, title, itemsToShare }) => {
  const [selectedItems, setSelectedItems] = useState({});

  // Initialise la sélection quand les items changent
  useEffect(() => {
    const initialSelection = {};
    itemsToShare.forEach(item => {
      if (item.content) {
        initialSelection[item.id] = true; // Par défaut, tout est sélectionné
      }
    });
    setSelectedItems(initialSelection);
  }, [itemsToShare]);

  const handleToggleItem = (id) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  // Construit le texte final à partager
  const getShareableText = () => {
    let text = `${title}\n\n`;
    itemsToShare.forEach(item => {
      if (selectedItems[item.id] && item.content) {
        text += `--- ${item.title.toUpperCase()} ---\n${item.content}\n\n`;
      }
    });
    return text.trim();
  };

  const handleShare = async () => {
    const textToShare = getShareableText();
    if (!textToShare) {
      alert("Veuillez sélectionner au moins un élément à partager.");
      return;
    }

    // Utilise la Web Share API si disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: textToShare,
        });
        console.log('Contenu partagé avec succès !');
      } catch (error) {
        console.error('Erreur lors du partage :', error);
      }
    } else {
      // Fallback pour les navigateurs non compatibles
      alert("La fonction de partage n'est pas supportée. Vous pouvez copier le texte.");
      handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = () => {
    const textToShare = getShareableText();
    navigator.clipboard.writeText(textToShare).then(() => {
      alert('Texte copié dans le presse-papiers !');
    }).catch(err => {
      console.error('Erreur lors de la copie :', err);
    });
  };

  const handleShareByEmail = () => {
    const textToShare = getShareableText();
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(textToShare);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <header className="share-modal-header">
          <h2>Partager votre préparation</h2>
          <button className="close-button" onClick={onClose} aria-label="Fermer la modale">
            <X size={24} />
          </button>
        </header>

        <section className="share-modal-selection">
          <h3>1. Choisissez le contenu à envoyer</h3>
          {itemsToShare.map(item => (
            <ShareItem
              key={item.id}
              title={item.title}
              content={item.content}
              isSelected={!!selectedItems[item.id]}
              onToggle={() => handleToggleItem(item.id)}
            />
          ))}
        </section>

        <section className="share-modal-actions">
          <h3>2. Choisissez une méthode de partage</h3>
          <div className="action-buttons-container">
            {/* Bouton générique pour Web Share API */}
            {navigator.share && (
              <button className="action-button" onClick={handleShare}>
                <Share2 size={20} /> Partager via...
              </button>
            )}
            <button className="action-button" onClick={handleCopyToClipboard}>
              <Link2 size={20} /> Copier le texte
            </button>
            <button className="action-button" onClick={handleShareByEmail}>
              <Mail size={20} /> Envoyer par E-mail
            </button>
            {/* Ajoutez d'autres boutons pour WhatsApp, etc. si nécessaire */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShareModal;