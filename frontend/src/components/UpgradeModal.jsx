// frontend/src/components/UpgradeModal.jsx
import React, { useState } from 'react';
import { X, Check, Zap, Heart, Star, Crown } from 'lucide-react';
import { monetizationService } from '../services/monetizationService';
import './UpgradeModal.scss';

const UpgradeModal = ({ isOpen, onClose, trigger = 'limit_reached', featureBlocked = null }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium');

  if (!isOpen) return null;

  const handleUpgrade = async (planType) => {
    setLoading(true);
    try {
      await monetizationService.trackEvent('upgrade_clicked', {
        plan_type: planType,
        trigger,
        feature_blocked: featureBlocked
      });

      await monetizationService.redirectToCheckout(planType);
    } catch (error) {
      console.error('Erreur upgrade:', error);
      alert('Erreur lors de la redirection vers le paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'limit_reached':
        return {
          title: "Limite mensuelle atteinte 📝",
          subtitle: "Vous avez utilisé vos 3 conversations gratuites ce mois-ci"
        };
      case 'feature_blocked':
        return {
          title: "Fonctionnalité Premium 🌟",
          subtitle: `L'accès à ${featureBlocked} nécessite un abonnement premium`
        };
      case 'soft_wall':
        return {
          title: "Plus qu'une conversation ! 💭",
          subtitle: "Passez à Premium pour des conversations illimitées"
        };
      default:
        return {
          title: "Débloquez tout le potentiel d'Olivia 🚀",
          subtitle: "Accédez à toutes les fonctionnalités premium"
        };
    }
  };

  const message = getTriggerMessage();

  return (
    <div className="upgrade-modal-backdrop" onClick={onClose}>
      <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
        <button className="upgrade-modal__close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="upgrade-modal__header">
          <div className="upgrade-modal__icon">
            <Crown size={32} />
          </div>
          <h2>{message.title}</h2>
          <p>{message.subtitle}</p>
        </div>

        <div className="upgrade-modal__plans">
          {/* Plan Premium */}
          <div 
            className={`plan-card ${selectedPlan === 'premium' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('premium')}
          >
            <div className="plan-card__header">
              <div className="plan-card__icon premium">
                <Star size={24} />
              </div>
              <h3>Olivia Premium</h3>
              <div className="plan-card__badge popular">Populaire</div>
            </div>
            
            <div className="plan-card__price">
              <span className="price">19,99€</span>
              <span className="period">/mois</span>
            </div>

            <ul className="plan-card__features">
              <li><Check size={16} /> Conversations illimitées</li>
              <li><Check size={16} /> Exercices avancés de relaxation</li>
              <li><Check size={16} /> Voyages sonores personnalisés</li>
              <li><Check size={16} /> Programmes anti-stress</li>
              <li><Check size={16} /> Support prioritaire</li>
            </ul>

            <button 
              className="plan-card__button premium"
              onClick={() => handleUpgrade('premium')}
              disabled={loading}
            >
              {loading && selectedPlan === 'premium' ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Zap size={16} />
                  Choisir Premium
                </>
              )}
            </button>
          </div>

          {/* Plan Thérapie */}
          <div 
            className={`plan-card ${selectedPlan === 'therapy' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('therapy')}
          >
            <div className="plan-card__header">
              <div className="plan-card__icon therapy">
                <Heart size={24} />
              </div>
              <h3>Olivia Thérapie</h3>
              <div className="plan-card__badge advanced">Avancé</div>
            </div>
            
            <div className="plan-card__price">
              <span className="price">39,99€</span>
              <span className="period">/mois</span>
            </div>

            <ul className="plan-card__features">
              <li><Check size={16} /> Tout Premium inclus</li>
              <li><Check size={16} /> Préparation séances thérapeutiques</li>
              <li><Check size={16} /> Outils thérapeutiques avancés</li>
              <li><Check size={16} /> Analyses comportementales</li>
              <li><Check size={16} /> Support thérapeutique dédié</li>
              <li><Check size={16} /> Connexion praticiens partenaires</li>
            </ul>

            <button 
              className="plan-card__button therapy"
              onClick={() => handleUpgrade('therapy')}
              disabled={loading}
            >
              {loading && selectedPlan === 'therapy' ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Heart size={16} />
                  Choisir Thérapie
                </>
              )}
            </button>
          </div>
        </div>

        <div className="upgrade-modal__benefits">
          <h4>Pourquoi passer à Premium ?</h4>
          <div className="benefits-grid">
            <div className="benefit">
              <Zap className="benefit__icon" />
              <span>Accès illimité à Olivia</span>
            </div>
            <div className="benefit">
              <Star className="benefit__icon" />
              <span>Fonctionnalités exclusives</span>
            </div>
            <div className="benefit">
              <Heart className="benefit__icon" />
              <span>Support personnalisé</span>
            </div>
          </div>
        </div>

        <div className="upgrade-modal__guarantee">
          <p>✨ Garantie satisfait ou remboursé 30 jours</p>
          <p>🔒 Paiement sécurisé par Stripe</p>
          <p>🔄 Annulation à tout moment</p>
        </div>

        <div className="upgrade-modal__footer">
          <button className="link-button" onClick={onClose}>
            Peut-être plus tard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;