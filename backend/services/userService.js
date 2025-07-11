// backend/services/userService.js
const UserModel = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

class UserService {
  constructor() {
    this.usersFile = path.join(__dirname, '../data/users.json');
    this.users = new Map(); // Cache en mémoire
    this.analyticsFile = path.join(__dirname, '../data/analytics.json');
    this.analytics = [];
    this.initialized = false;
  }

  // Initialiser le service (charger les données)
  async init() {
    if (this.initialized) return;
    
    try {
      // Créer le dossier data s'il n'existe pas
      await fs.mkdir(path.join(__dirname, '../data'), { recursive: true });
      
      // Charger les utilisateurs
      try {
        const usersData = await fs.readFile(this.usersFile, 'utf8');
        const usersArray = JSON.parse(usersData);
        usersArray.forEach(user => {
          this.users.set(user.google_id, user);
        });
        console.log(`${usersArray.length} utilisateurs chargés`);
      } catch (error) {
        console.log('Aucun fichier utilisateurs existant, création...');
        await this.saveUsers();
      }

      // Charger les analytics
      try {
        const analyticsData = await fs.readFile(this.analyticsFile, 'utf8');
        this.analytics = JSON.parse(analyticsData);
        console.log(`${this.analytics.length} événements analytics chargés`);
      } catch (error) {
        console.log('Aucun fichier analytics existant, création...');
        await this.saveAnalytics();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Erreur initialisation UserService:', error);
      throw error;
    }
  }

  // Sauvegarder les utilisateurs
  async saveUsers() {
    try {
      const usersArray = Array.from(this.users.values());
      await fs.writeFile(this.usersFile, JSON.stringify(usersArray, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde utilisateurs:', error);
    }
  }

  // Sauvegarder les analytics
  async saveAnalytics() {
    try {
      await fs.writeFile(this.analyticsFile, JSON.stringify(this.analytics, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde analytics:', error);
    }
  }

  // Obtenir ou créer un utilisateur
  async getOrCreateUser(googleUserData) {
    await this.init();
    
    let user = this.users.get(googleUserData.id);
    
    if (!user) {
      // Créer nouvel utilisateur
      user = UserModel.createUser(googleUserData);
      this.users.set(googleUserData.id, user);
      await this.saveUsers();
      
      // Log analytics signup
      await this.trackEvent('signup', user.id, {
        email: user.email,
        source: 'google_auth'
      });
    } else {
      // Mettre à jour last_login
      user.last_login = new Date();
      await this.saveUsers();
    }
    
    return user;
  }

  // Obtenir un utilisateur par Google ID
  async getUserByGoogleId(googleId) {
    await this.init();
    return this.users.get(googleId);
  }

  // Obtenir un utilisateur par email
  async getUserByEmail(email) {
    await this.init();
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  // Mettre à jour un utilisateur
  async updateUser(googleId, updates) {
    await this.init();
    const user = this.users.get(googleId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    Object.assign(user, updates, { updated_at: new Date() });
    this.users.set(googleId, user);
    await this.saveUsers();
    return user;
  }

  // Vérifier les limites utilisateur
  async checkUserLimits(googleId, action = 'conversation') {
    await this.init();
    const user = this.users.get(googleId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return UserModel.checkUserLimits(user, action);
  }

  // Incrémenter l'usage utilisateur
  async incrementUserUsage(googleId, action = 'conversation', amount = 1) {
    await this.init();
    const user = this.users.get(googleId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    UserModel.incrementUsage(user, action, amount);
    this.users.set(googleId, user);
    await this.saveUsers();
    
    // Track usage analytics
    await this.trackEvent('feature_usage', user.id, {
      action,
      amount,
      subscription_type: user.subscription_type
    });
    
    return user;
  }

  // Mettre à jour l'abonnement
  async updateSubscription(googleId, subscriptionData) {
    await this.init();
    const user = this.users.get(googleId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const oldType = user.subscription_type;
    UserModel.updateSubscription(user, subscriptionData);
    this.users.set(googleId, user);
    await this.saveUsers();
    
    // Track subscription change
    if (oldType !== subscriptionData.type) {
      await this.trackEvent('premium_conversion', user.id, {
        from_plan: oldType,
        to_plan: subscriptionData.type,
        stripe_customer_id: subscriptionData.stripe_customer_id
      });
    }
    
    return user;
  }

  // Obtenir les infos d'abonnement
  async getSubscriptionInfo(googleId) {
    await this.init();
    const user = this.users.get(googleId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return UserModel.getSubscriptionInfo(user);
  }

  // Système d'analytics
  async trackEvent(eventType, userId, data = {}) {
    await this.init();
    
    const event = {
      id: Date.now() + Math.random(),
      type: eventType,
      user_id: userId,
      data,
      timestamp: new Date(),
      session_id: `session_${Date.now()}`
    };
    
    this.analytics.push(event);
    
    // Garder seulement les 10000 derniers événements
    if (this.analytics.length > 10000) {
      this.analytics = this.analytics.slice(-10000);
    }
    
    await this.saveAnalytics();
    return event;
  }

  // Obtenir les analytics
  async getAnalytics(startDate, endDate, eventType = null) {
    await this.init();
    
    let filteredEvents = this.analytics;
    
    if (startDate) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.timestamp) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.timestamp) <= new Date(endDate)
      );
    }
    
    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.type === eventType);
    }
    
    return filteredEvents;
  }

  // Obtenir les métriques KPI
  async getKPIMetrics() {
    await this.init();
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    // Compter les utilisateurs par type d'abonnement
    const subscriptionCounts = {
      free: 0,
      premium: 0,
      therapy: 0,
      total: 0
    };
    
    let totalMRR = 0;
    
    for (const user of this.users.values()) {
      subscriptionCounts[user.subscription_type]++;
      subscriptionCounts.total++;
      
      // Calculer MRR
      if (user.subscription_type === 'premium' && user.subscription_status === 'active') {
        totalMRR += 19.99;
      } else if (user.subscription_type === 'therapy' && user.subscription_status === 'active') {
        totalMRR += 39.99;
      }
    }
    
    // Événements du mois dernier
    const recentEvents = await this.getAnalytics(lastMonth.toISOString());
    const signups = recentEvents.filter(e => e.type === 'signup').length;
    const conversions = recentEvents.filter(e => e.type === 'premium_conversion').length;
    const churnEvents = recentEvents.filter(e => e.type === 'churn').length;
    
    const conversionRate = signups > 0 ? (conversions / signups * 100).toFixed(2) : 0;
    
    return {
      users: subscriptionCounts,
      mrr: totalMRR.toFixed(2),
      metrics: {
        signups_last_month: signups,
        conversions_last_month: conversions,
        churn_last_month: churnEvents,
        conversion_rate: conversionRate + '%'
      },
      updated_at: now
    };
  }
}

module.exports = new UserService();