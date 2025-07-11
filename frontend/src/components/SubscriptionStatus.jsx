// frontend/src/components/SubscriptionStatus.jsx
import React, { useState, useEffect } from 'react';
import { Crown, MessageCircle, Settings, ExternalLink } from 'lucide-react';
import { monetizationService } from '../services/monetizationService';
import UpgradeModal from './UpgradeModal';
import './SubscriptionStatus.scss';

const SubscriptionStatus = ({ compact = false }) => {
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    loadUserStatus();
  }, []);

  const loadUserStatus = async () => {
    try {
      const status = await monetizationService.getUserStatus();
      setUserStatus(status);
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const portal = await monetizationService.createPortalSession();
      window.open(portal.url, '_blank');
    } catch (error) {
      console.error('Erreur portail client:', error);
      alert('Erreur lors de l\'ouverture du portail de gestion');
    }
  };

  if (loading) {
    return (
      <div className={`subscription-status ${compact ? 'compact' : ''}`}>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (!userStatus) {
    return null;
  }

  const { user, subscription, limits } = userStatus;
  const statusDisplay = monetizationService.getSubscriptionStatusDisplay();

  if (compact) {
    return (
      <div className="subscription-status compact">
        <div className={`status-badge ${statusDisplay.color}`}>
          {user.subscription_type === 'free' ? (
            <MessageCircle size={12} />
          ) : (
            <Crown size={12} />
          )}
          <span>{statusDisplay.text}</span>
        </div>
        
        {user.subscription_type === 'free' && limits && (
          <div className="usage-indicator">
            <span className="usage-text">
              {limits.used}/{limits.limit}
            </span>
            <div className="usage-bar">
              <div 
                className="usage-fill"
                style={{ 
                  width: `${(limits.used / limits.limit) * 100}%`,
                  backgroundColor: limits.used >= limits.limit ? '#ef4444' : '#3b82f6'
                }}
              />
            </div>
          </div>
        )}

        {user.subscription_type === 'free' && (
          <button 
            className="upgrade-button-compact"
            onClick={() => setShowUpgradeModal(true)}
          >
            <Crown size={12} />
          </button>
        )}

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          trigger="manual"
        />
      </div>
    );
  }

  return (
    <div className="subscription-status">
      <div className="subscription-status__header">
        <div className="subscription-info">
          <div className={`status-badge ${statusDisplay.color}`}>
            {user.subscription_type === 'free' ? (
              <MessageCircle size={16} />
            ) : (
              <Crown size={16} />
            )}
            <span>{statusDisplay.text}</span>
          </div>
          <p className="user-email">{user.email}</p>
        </div>
      </div>

      {user.subscription_type === 'free' && (
        <div className="subscription-status__usage">
          <h4>Utilisation mensuelle</h4>
          <div className="usage-stats">
            <div className="usage-item">
              <MessageCircle size={16} />
              <span>Conversations</span>
              <span className="usage-count">
                {limits?.used || 0}/{limits?.limit || 3}
              </span>
            </div>
            <div className="usage-bar">
              <div 
                className="usage-fill"
                style={{ 
                  width: `${((limits?.used || 0) / (limits?.limit || 3)) * 100}%`,
                  backgroundColor: (limits?.used || 0) >= (limits?.limit || 3) ? '#ef4444' : '#3b82f6'
                }}
              />
            </div>
          </div>

          {limits && limits.used >= limits.limit && (
            <div className="limit-reached">
              <p>🚫 Limite mensuelle atteinte</p>
              <p>Passez à Premium pour des conversations illimitées</p>
            </div>
          )}
        </div>
      )}

      {user.subscription_type !== 'free' && subscription && (
        <div className="subscription-status__details">
          <h4>Détails de l'abonnement</h4>
          <div className="subscription-info-grid">
            <div className="info-item">
              <span className="label">Plan:</span>
              <span className="value">{monetizationService.getPlanInfo(user.subscription_type).name}</span>
            </div>
            {subscription.billing.current_period_end && (
              <div className="info-item">
                <span className="label">Renouvellement:</span>
                <span className="value">
                  {new Date(subscription.billing.current_period_end).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="subscription-status__actions">
        {user.subscription_type === 'free' ? (
          <button 
            className="upgrade-button"
            onClick={() => setShowUpgradeModal(true)}
          >
            <Crown size={16} />
            Passer à Premium
          </button>
        ) : (
          <button 
            className="manage-button"
            onClick={handleManageSubscription}
          >
            <Settings size={16} />
            Gérer l'abonnement
            <ExternalLink size={14} />
          </button>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="manual"
      />
    </div>
  );
};

export default SubscriptionStatus;