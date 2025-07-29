// backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { authenticateUser } = require('../middleware/premiumMiddleware');

// Middleware pour vérifier les droits admin (basique pour démo)
const requireAdmin = (req, res, next) => {
  // Pour la démo, on considère que certains emails sont admin
  const adminEmails = [
    'admin@oliviaseren.is',
    'dev@oliviaseren.is',
    process.env.ADMIN_EMAIL
  ].filter(Boolean);

  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Accès admin requis' });
  }
  
  next();
};

// Track un événement analytics
router.post('/track', authenticateUser, async (req, res) => {
  try {
    const { eventType, data = {} } = req.body;
    
    if (!eventType) {
      return res.status(400).json({ error: 'Type d\'événement requis' });
    }

    const event = await userService.trackEvent(eventType, req.user.id, {
      ...data,
      user_agent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({ event_id: event.id, tracked: true });
  } catch (error) {
    console.error('Erreur tracking analytics:', error);
    res.status(500).json({ error: 'Erreur lors du tracking' });
  }
});

// Obtenir les métriques KPI (admin seulement)
router.get('/kpi', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const metrics = await userService.getKPIMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Erreur récupération KPI:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métriques' });
  }
});

// Obtenir les événements analytics avec filtres (admin seulement)
router.get('/events', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      event_type, 
      limit = 100,
      offset = 0 
    } = req.query;

    let events = await userService.getAnalytics(start_date, end_date, event_type);
    
    // Pagination simple
    const total = events.length;
    events = events.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      events,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
});

// Obtenir les métriques de conversion par période
router.get('/conversion-metrics', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // jours
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const events = await userService.getAnalytics(startDate.toISOString());
    
    // Calculer les métriques de conversion
    const signups = events.filter(e => e.type === 'signup');
    const conversions = events.filter(e => e.type === 'premium_conversion');
    const checkouts = events.filter(e => e.type === 'checkout_initiated');
    
    // Grouper par jour
    const dailyMetrics = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          date,
          signups: 0,
          conversions: 0,
          checkouts: 0,
          revenue: 0
        };
      }
      
      if (event.type === 'signup') {
        dailyMetrics[date].signups++;
      } else if (event.type === 'premium_conversion') {
        dailyMetrics[date].conversions++;
      } else if (event.type === 'checkout_initiated') {
        dailyMetrics[date].checkouts++;
      } else if (event.type === 'payment_succeeded') {
        dailyMetrics[date].revenue += event.data?.amount || 0;
      }
    });

    const sortedMetrics = Object.values(dailyMetrics).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Métriques globales
    const totalSignups = signups.length;
    const totalConversions = conversions.length;
    const conversionRate = totalSignups > 0 ? (totalConversions / totalSignups * 100).toFixed(2) : 0;
    const checkoutConversionRate = checkouts.length > 0 ? (totalConversions / checkouts.length * 100).toFixed(2) : 0;

    res.json({
      period_days: daysAgo,
      overview: {
        total_signups: totalSignups,
        total_conversions: totalConversions,
        total_checkouts: checkouts.length,
        conversion_rate: parseFloat(conversionRate),
        checkout_conversion_rate: parseFloat(checkoutConversionRate)
      },
      daily_metrics: sortedMetrics
    });
  } catch (error) {
    console.error('Erreur métriques conversion:', error);
    res.status(500).json({ error: 'Erreur lors du calcul des métriques' });
  }
});

// Obtenir les statistiques d'usage des fonctionnalités
router.get('/feature-usage', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const daysAgo = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const events = await userService.getAnalytics(startDate.toISOString(), null, 'feature_usage');
    
    // Analyser l'usage par type d'action et type d'abonnement
    const featureStats = {};
    
    events.forEach(event => {
      const action = event.data?.action || 'unknown';
      const subscriptionType = event.data?.subscription_type || 'free';
      
      if (!featureStats[action]) {
        featureStats[action] = {
          total_usage: 0,
          by_subscription: {
            free: 0,
            premium: 0,
            therapy: 0
          },
          unique_users: new Set()
        };
      }
      
      featureStats[action].total_usage += event.data?.amount || 1;
      featureStats[action].by_subscription[subscriptionType] += event.data?.amount || 1;
      featureStats[action].unique_users.add(event.user_id);
    });

    // Convertir les Sets en nombres
    Object.keys(featureStats).forEach(action => {
      featureStats[action].unique_users = featureStats[action].unique_users.size;
    });

    res.json({
      period_days: daysAgo,
      feature_usage: featureStats
    });
  } catch (error) {
    console.error('Erreur statistiques usage:', error);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques d\'usage' });
  }
});

// Obtenir le statut utilisateur (usage et limites)
router.get('/user-status', authenticateUser, async (req, res) => {
  try {
    const subscriptionInfo = await userService.getSubscriptionInfo(req.user.google_id);
    const limitsCheck = await userService.checkUserLimits(req.user.google_id, 'conversation');
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        subscription_type: req.user.subscription_type
      },
      subscription: subscriptionInfo,
      current_limits: limitsCheck,
      should_show_upgrade: req.user.subscription_type === 'free' && 
                          (!limitsCheck.allowed || limitsCheck.remaining <= 1)
    });
  } catch (error) {
    console.error('Erreur statut utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

module.exports = router;