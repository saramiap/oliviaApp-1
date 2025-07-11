// frontend/src/services/monetizationService.js
import axios from 'axios';

class MonetizationService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.token = null;
    this.user = null;
    this.subscription = null;
  }

  // Configurer l'authentification
  setAuth(token, user) {
    this.token = token;
    this.user = user;
    
    // Configurer axios avec le token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Effacer l'authentification
  clearAuth() {
    this.token = null;
    this.user = null;
    this.subscription = null;
    delete axios.defaults.headers.common['Authorization'];
  }

  // Obtenir le statut utilisateur actuel
  async getUserStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/user-status`);
      this.user = response.data.user;
      this.subscription = response.data.subscription;
      return response.data;
    } catch (error) {
      console.error('Erreur récupération statut utilisateur:', error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur peut utiliser une fonctionnalité
  canUseFeature(feature) {
    if (!this.subscription) return false;
    
    const limits = this.subscription.limits;
    return limits && limits.features && limits.features.includes(feature);
  }

  // Vérifier les limites de conversation
  canSendMessage() {
    if (!this.subscription) return { allowed: false, reason: 'No subscription data' };
    
    const usage = this.subscription.usage;
    if (!usage) return { allowed: false, reason: 'No usage data' };
    
    // Utilisateurs premium/therapy ont accès illimité
    if (this.user?.subscription_type !== 'free') {
      return { allowed: true, remaining: -1 };
    }
    
    // Utilisateurs gratuits : vérifier les limites
    const limit = usage.conversations_limit;
    const used = usage.conversations_used;
    
    if (limit === -1) return { allowed: true, remaining: -1 };
    if (used >= limit) return { 
      allowed: false, 
      reason: 'Monthly limit reached',
      limit,
      used 
    };
    
    return { 
      allowed: true, 
      remaining: limit - used,
      limit,
      used
    };
  }

  // Déterminer si on doit afficher l'upgrade modal
  shouldShowUpgrade() {
    if (!this.user || this.user.subscription_type !== 'free') return false;
    
    const messageCheck = this.canSendMessage();
    return !messageCheck.allowed || (messageCheck.remaining !== -1 && messageCheck.remaining <= 1);
  }

  // Créer une session de checkout Stripe
  async createCheckoutSession(planType) {
    try {
      const response = await axios.post(`${this.baseURL}/api/subscription/create-checkout-session`, {
        planType
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur création session checkout:', error);
      throw error;
    }
  }

  // Rediriger vers Stripe Checkout
  async redirectToCheckout(planType) {
    try {
      const session = await this.createCheckoutSession(planType);
      
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Erreur redirection checkout:', error);
      throw error;
    }
  }

  // Obtenir les détails de l'abonnement
  async getSubscriptionDetails() {
    try {
      const response = await axios.get(`${this.baseURL}/api/subscription/current`);
      this.subscription = response.data.current_subscription;
      return response.data;
    } catch (error) {
      console.error('Erreur récupération abonnement:', error);
      throw error;
    }
  }

  // Créer une session du portail client
  async createPortalSession() {
    try {
      const response = await axios.post(`${this.baseURL}/api/subscription/create-portal-session`);
      return response.data;
    } catch (error) {
      console.error('Erreur création portail client:', error);
      throw error;
    }
  }

  // Annuler l'abonnement
  async cancelSubscription() {
    try {
      const response = await axios.post(`${this.baseURL}/api/subscription/cancel`);
      await this.getUserStatus(); // Refresh status
      return response.data;
    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      throw error;
    }
  }

  // Réactiver l'abonnement
  async reactivateSubscription() {
    try {
      const response = await axios.post(`${this.baseURL}/api/subscription/reactivate`);
      await this.getUserStatus(); // Refresh status
      return response.data;
    } catch (error) {
      console.error('Erreur réactivation abonnement:', error);
      throw error;
    }
  }

  // Tracker les événements analytics
  async trackEvent(eventType, data = {}) {
    try {
      await axios.post(`${this.baseURL}/api/analytics/track`, {
        eventType,
        data
      });
    } catch (error) {
      console.warn('Erreur tracking analytics:', error);
      // Ne pas faire échouer l'application pour les erreurs d'analytics
    }
  }

  // Obtenir les informations de plan
  getPlanInfo(planType) {
    const plans = {
      free: {
        name: 'Olivia Gratuit',
        price: '0€',
        features: [
          '3 conversations par mois',
          'Accès au journal personnel',
          'Exercices de base'
        ],
        limitations: [
          'Conversations limitées',
          'Pas d\'accès aux fonctionnalités avancées'
        ]
      },
      premium: {
        name: 'Olivia Premium',
        price: '19,99€/mois',
        features: [
          'Conversations illimitées',
          'Accès aux exercices avancés', 
          'Voyages sonores personnalisés',
          'Programmes anti-stress',
          'Support prioritaire'
        ],
        popular: true
      },
      therapy: {
        name: 'Olivia Thérapie',
        price: '39,99€/mois',
        features: [
          'Tout Olivia Premium inclus',
          'Préparation de séances thérapeutiques',
          'Outils thérapeutiques avancés',
          'Analyses comportementales',
          'Support thérapeutique dédié',
          'Connexion praticiens partenaires'
        ],
        advanced: true
      }
    };
    
    return plans[planType] || plans.free;
  }

  // Formater le statut d'abonnement pour l'affichage
  getSubscriptionStatusDisplay() {
    if (!this.user || !this.subscription) {
      return { text: 'Non connecté', color: 'gray' };
    }

    const type = this.user.subscription_type;
    const status = this.user.subscription_status;

    if (type === 'free') {
      return { text: 'Gratuit', color: 'blue' };
    }

    if (status === 'active') {
      return { 
        text: type === 'premium' ? 'Premium' : 'Thérapie', 
        color: 'green' 
      };
    }

    if (status === 'cancelled') {
      return { text: 'Annulé', color: 'orange' };
    }

    if (status === 'past_due') {
      return { text: 'Paiement en retard', color: 'red' };
    }

    return { text: status, color: 'gray' };
  }
}

// Instance singleton
export const monetizationService = new MonetizationService();