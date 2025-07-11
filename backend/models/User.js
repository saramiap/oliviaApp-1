// backend/models/User.js
const crypto = require('crypto');

class UserModel {
  constructor() {
    // Configuration par défaut pour les utilisateurs
    this.defaultLimits = {
      free: {
        conversations_per_month: 3,
        features: ['basic_chat', 'journal']
      },
      premium: {
        conversations_per_month: -1, // illimité
        features: ['basic_chat', 'journal', 'advanced_exercises', 'sound_journeys', 'stress_programs']
      },
      therapy: {
        conversations_per_month: -1, // illimité
        features: ['basic_chat', 'journal', 'advanced_exercises', 'sound_journeys', 'stress_programs', 'session_prep', 'therapy_tools']
      }
    };
  }

  // Créer un nouvel utilisateur avec paramètres par défaut
  createUser(googleUserData) {
    const now = new Date();
    const user = {
      id: crypto.randomUUID(),
      google_id: googleUserData.id,
      email: googleUserData.email,
      name: googleUserData.name,
      picture: googleUserData.picture,
      given_name: googleUserData.given_name,
      family_name: googleUserData.family_name,
      email_verified: googleUserData.email_verified,
      
      // Champs d'abonnement
      subscription_type: 'free', // 'free', 'premium', 'therapy'
      subscription_status: 'active', // 'active', 'cancelled', 'past_due', 'unpaid'
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_start: null,
      current_period_end: null,
      
      // Compteurs d'usage
      conversations_used: 0,
      reset_date: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // Reset chaque mois
      
      // Metadata
      created_at: now,
      updated_at: now,
      last_login: now,
      
      // Préférences utilisateur
      preferences: {
        voice_enabled: false,
        analytics_opt_in: true,
        marketing_emails: true
      }
    };

    return user;
  }

  // Vérifier les limites utilisateur
  checkUserLimits(user, action = 'conversation') {
    const limits = this.defaultLimits[user.subscription_type];
    
    if (!limits) {
      return { allowed: false, reason: 'Invalid subscription type' };
    }

    // Vérifier si le reset date est passé (nouveau mois)
    const now = new Date();
    const resetDate = new Date(user.reset_date);
    const monthsPassed = (now.getFullYear() - resetDate.getFullYear()) * 12 + 
                        (now.getMonth() - resetDate.getMonth());
    
    if (monthsPassed > 0) {
      // Reset du compteur mensuel
      user.conversations_used = 0;
      user.reset_date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    if (action === 'conversation') {
      if (limits.conversations_per_month === -1) {
        return { allowed: true, remaining: -1 }; // Illimité
      }
      
      if (user.conversations_used >= limits.conversations_per_month) {
        return { 
          allowed: false, 
          reason: 'Monthly conversation limit reached',
          limit: limits.conversations_per_month,
          used: user.conversations_used
        };
      }
      
      return { 
        allowed: true, 
        remaining: limits.conversations_per_month - user.conversations_used,
        limit: limits.conversations_per_month,
        used: user.conversations_used
      };
    }

    return { allowed: true };
  }

  // Incrémenter l'usage
  incrementUsage(user, action = 'conversation', amount = 1) {
    if (action === 'conversation') {
      user.conversations_used += amount;
    }
    user.updated_at = new Date();
    return user;
  }

  // Vérifier les permissions de fonctionnalités
  hasFeatureAccess(user, feature) {
    const limits = this.defaultLimits[user.subscription_type];
    return limits && limits.features.includes(feature);
  }

  // Mettre à jour l'abonnement
  updateSubscription(user, subscriptionData) {
    user.subscription_type = subscriptionData.type;
    user.subscription_status = subscriptionData.status;
    user.stripe_customer_id = subscriptionData.stripe_customer_id;
    user.stripe_subscription_id = subscriptionData.stripe_subscription_id;
    user.current_period_start = subscriptionData.current_period_start;
    user.current_period_end = subscriptionData.current_period_end;
    user.updated_at = new Date();
    
    // Reset du compteur si upgrade vers premium/therapy
    if (subscriptionData.type !== 'free') {
      user.conversations_used = 0;
    }
    
    return user;
  }

  // Obtenir les infos d'abonnement formatées
  getSubscriptionInfo(user) {
    return {
      type: user.subscription_type,
      status: user.subscription_status,
      limits: this.defaultLimits[user.subscription_type],
      usage: {
        conversations_used: user.conversations_used,
        conversations_limit: this.defaultLimits[user.subscription_type]?.conversations_per_month || 0,
        reset_date: user.reset_date
      },
      billing: {
        current_period_start: user.current_period_start,
        current_period_end: user.current_period_end,
        stripe_customer_id: user.stripe_customer_id
      }
    };
  }
}

module.exports = new UserModel();