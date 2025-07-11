// backend/middleware/premiumMiddleware.js
const userService = require('../services/userService');

// Middleware pour vérifier l'authentification
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    // Pour l'instant, on récupère l'utilisateur par Google ID depuis le token
    // Dans un vrai système, on vérifierait le JWT token
    const googleId = authHeader.replace('Bearer ', '');
    const user = await userService.getUserByGoogleId(googleId);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    res.status(500).json({ error: 'Erreur serveur d\'authentification' });
  }
};

// Middleware pour vérifier les limites d'usage
const checkUsageLimits = (action = 'conversation') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const limitsCheck = await userService.checkUserLimits(req.user.google_id, action);
      
      if (!limitsCheck.allowed) {
        return res.status(403).json({
          error: 'Limite d\'usage atteinte',
          message: limitsCheck.reason,
          limit: limitsCheck.limit,
          used: limitsCheck.used,
          subscription_type: req.user.subscription_type,
          upgrade_required: true
        });
      }

      req.usageLimits = limitsCheck;
      next();
    } catch (error) {
      console.error('Erreur vérification limites:', error);
      res.status(500).json({ error: 'Erreur serveur de vérification' });
    }
  };
};

// Middleware pour vérifier l'accès aux fonctionnalités premium
const requirePremium = (requiredFeature = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const isFreeTier = req.user.subscription_type === 'free';
      
      if (isFreeTier && requiredFeature) {
        const UserModel = require('../models/User');
        const hasAccess = UserModel.hasFeatureAccess(req.user, requiredFeature);
        
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Fonctionnalité premium requise',
            feature: requiredFeature,
            subscription_type: req.user.subscription_type,
            upgrade_required: true,
            available_plans: ['premium', 'therapy']
          });
        }
      }

      next();
    } catch (error) {
      console.error('Erreur vérification premium:', error);
      res.status(500).json({ error: 'Erreur serveur de vérification premium' });
    }
  };
};

// Middleware pour incrémenter l'usage après succès
const incrementUsage = (action = 'conversation', amount = 1) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next();
      }

      // Stocker les infos pour utilisation après la réponse
      res.locals.incrementUsage = {
        googleId: req.user.google_id,
        action,
        amount
      };

      next();
    } catch (error) {
      console.error('Erreur préparation incrément usage:', error);
      next(); // Continuer même en cas d'erreur
    }
  };
};

// Middleware pour exécuter l'incrément d'usage après la réponse
const executeUsageIncrement = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Exécuter l'incrément en arrière-plan après avoir envoyé la réponse
    if (res.locals.incrementUsage && res.statusCode < 400) {
      setImmediate(async () => {
        try {
          await userService.incrementUserUsage(
            res.locals.incrementUsage.googleId,
            res.locals.incrementUsage.action,
            res.locals.incrementUsage.amount
          );
        } catch (error) {
          console.error('Erreur incrément usage en arrière-plan:', error);
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware pour créer des "soft walls" avec infos d'upgrade
const softWall = (feature, action = 'conversation') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const limitsCheck = await userService.checkUserLimits(req.user.google_id, action);
      const isFreeTier = req.user.subscription_type === 'free';

      // Ajouter des informations d'upgrade dans la réponse
      req.upgradeInfo = {
        should_show_upgrade: isFreeTier && (
          !limitsCheck.allowed || 
          (limitsCheck.remaining !== -1 && limitsCheck.remaining <= 1)
        ),
        subscription_type: req.user.subscription_type,
        limits: limitsCheck,
        feature,
        plans: {
          premium: {
            price: '19,99€/mois',
            features: ['Conversations illimitées', 'Exercices avancés', 'Voyages sonores']
          },
          therapy: {
            price: '39,99€/mois',
            features: ['Tout Premium', 'Préparation séances', 'Outils thérapeutiques']
          }
        }
      };

      next();
    } catch (error) {
      console.error('Erreur soft wall:', error);
      next(); // Continuer même en cas d'erreur
    }
  };
};

module.exports = {
  authenticateUser,
  checkUsageLimits,
  requirePremium,
  incrementUsage,
  executeUsageIncrement,
  softWall
};