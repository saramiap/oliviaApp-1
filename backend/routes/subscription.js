// backend/routes/subscription.js
const express = require('express');
const router = express.Router();
const stripeConfig = require('../config/stripe');
const userService = require('../services/userService');
const { authenticateUser, requirePremium } = require('../middleware/premiumMiddleware');

// Créer une session de checkout Stripe
router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { planType } = req.body; // 'premium' ou 'therapy'
    
    if (!planType || !stripeConfig.OLIVIA_PRODUCTS[planType]) {
      return res.status(400).json({ error: 'Type de plan invalide' });
    }

    const user = req.user;
    const product = stripeConfig.OLIVIA_PRODUCTS[planType];

    // Créer ou récupérer le client Stripe
    const customer = await stripeConfig.getOrCreateCustomer(user.email, user.name);
    
    // Mettre à jour l'utilisateur avec l'ID client Stripe
    await userService.updateUser(user.google_id, {
      stripe_customer_id: customer.id
    });

    // URLs de redirection
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/subscription/cancel`;

    // Créer la session de checkout
    const session = await stripeConfig.createCheckoutSession(
      customer.id,
      product.stripe_price_id,
      planType,
      successUrl,
      cancelUrl
    );

    // Track analytics
    await userService.trackEvent('checkout_initiated', user.id, {
      plan_type: planType,
      price: product.price,
      session_id: session.id
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Erreur création session checkout:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
  }
});

// Vérifier le statut d'une session de checkout
router.get('/checkout-session/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripeConfig.stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Récupérer l'abonnement
      const subscription = await stripeConfig.stripe.subscriptions.retrieve(session.subscription);
      
      // Mettre à jour l'utilisateur
      const subscriptionData = {
        type: session.metadata.plan_type,
        status: subscription.status,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      };
      
      await userService.updateSubscription(req.user.google_id, subscriptionData);
    }
    
    res.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    console.error('Erreur vérification session:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
  }
});

// Créer une session du portail client
router.post('/create-portal-session', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'Aucun abonnement trouvé' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const returnUrl = `${baseUrl}/subscription/manage`;

    const session = await stripeConfig.createCustomerPortalSession(
      user.stripe_customer_id,
      returnUrl
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création portail client:', error);
    res.status(500).json({ error: 'Erreur lors de l\'accès au portail de gestion' });
  }
});

// Obtenir les détails de l'abonnement actuel
router.get('/current', authenticateUser, async (req, res) => {
  try {
    const subscriptionInfo = await userService.getSubscriptionInfo(req.user.google_id);
    
    // Ajouter les détails des produits disponibles
    const availablePlans = Object.keys(stripeConfig.OLIVIA_PRODUCTS).map(key => ({
      id: key,
      ...stripeConfig.OLIVIA_PRODUCTS[key]
    }));

    res.json({
      current_subscription: subscriptionInfo,
      available_plans: availablePlans
    });
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'abonnement' });
  }
});

// Annuler l'abonnement (à la fin de la période)
router.post('/cancel', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripe_subscription_id) {
      return res.status(400).json({ error: 'Aucun abonnement actif trouvé' });
    }

    const subscription = await stripeConfig.cancelSubscription(user.stripe_subscription_id);
    
    // Mettre à jour le statut local
    await userService.updateUser(user.google_id, {
      subscription_status: 'cancelled'
    });

    // Track analytics
    await userService.trackEvent('churn', user.id, {
      subscription_type: user.subscription_type,
      cancellation_date: new Date(),
      cancel_at_period_end: subscription.cancel_at_period_end
    });

    res.json({
      message: 'Abonnement annulé avec succès',
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end
    });
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de l\'abonnement' });
  }
});

// Réactiver un abonnement annulé
router.post('/reactivate', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripe_subscription_id) {
      return res.status(400).json({ error: 'Aucun abonnement trouvé' });
    }

    const subscription = await stripeConfig.reactivateSubscription(user.stripe_subscription_id);
    
    // Mettre à jour le statut local
    await userService.updateUser(user.google_id, {
      subscription_status: subscription.status
    });

    res.json({
      message: 'Abonnement réactivé avec succès',
      status: subscription.status
    });
  } catch (error) {
    console.error('Erreur réactivation abonnement:', error);
    res.status(500).json({ error: 'Erreur lors de la réactivation de l\'abonnement' });
  }
});

module.exports = router;