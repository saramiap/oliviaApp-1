// frontend/src/pages/SubscriptionSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { monetizationService } from '../services/monetizationService';
import './SubscriptionSuccess.scss';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('Aucune session trouvée');
      setLoading(false);
      return;
    }

    verifySession(sessionId);
  }, [searchParams]);

  const verifySession = async (sessionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/subscription/checkout-session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${monetizationService.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du paiement');
      }

      const data = await response.json();
      setSessionData(data);

      if (data.status === 'paid') {
        // Rafraîchir le statut utilisateur
        await monetizationService.getUserStatus();
        
        // Tracker la conversion réussie
        await monetizationService.trackEvent('subscription_success', {
          session_id: sessionId,
          payment_status: data.status
        });
      }
    } catch (error) {
      console.error('Erreur vérification session:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/chat', { replace: true });
  };

  if (loading) {
    return (
      <div className="subscription-success">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Vérification de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-success">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/chat')} className="continue-button">
            Retourner au chat
          </button>
        </div>
      </div>
    );
  }

  const isPaid = sessionData?.status === 'paid';

  return (
    <div className="subscription-success">
      <div className="success-container">
        {isPaid ? (
          <>
            <div className="success-icon">
              <div className="icon-background">
                <Check size={48} />
              </div>
              <div className="sparkles">
                <Sparkles className="sparkle sparkle-1" size={20} />
                <Sparkles className="sparkle sparkle-2" size={16} />
                <Sparkles className="sparkle sparkle-3" size={18} />
              </div>
            </div>

            <h1>Bienvenue dans Olivia Premium ! 🎉</h1>
            <p className="success-subtitle">
              Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités premium.
            </p>

            <div className="benefits-showcase">
              <h3>Ce qui vous attend maintenant :</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <Crown className="benefit-icon premium" />
                  <div>
                    <h4>Conversations illimitées</h4>
                    <p>Discutez avec Olivia autant que vous le souhaitez</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <Sparkles className="benefit-icon premium" />
                  <div>
                    <h4>Fonctionnalités avancées</h4>
                    <p>Accès complet aux exercices et voyages sonores</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <Check className="benefit-icon premium" />
                  <div>
                    <h4>Support prioritaire</h4>
                    <p>Une aide rapide et personnalisée</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-info">
              <p>📧 Un reçu a été envoyé à : <strong>{sessionData.customer_email}</strong></p>
              <p>💳 Vous pouvez gérer votre abonnement à tout moment dans vos paramètres</p>
            </div>

            <div className="action-buttons">
              <button onClick={handleContinue} className="continue-button primary">
                Commencer à utiliser Premium
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => navigate('/subscription/manage')} 
                className="continue-button secondary"
              >
                Gérer mon abonnement
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="pending-icon">
              <div className="spinner"></div>
            </div>
            <h1>Paiement en cours de traitement</h1>
            <p>Votre paiement est en cours de vérification. Vous recevrez une confirmation par email.</p>
            <button onClick={handleContinue} className="continue-button">
              Retourner au chat
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;