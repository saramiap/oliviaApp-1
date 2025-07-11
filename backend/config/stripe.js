// backend/config/stripe.js
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration des produits Olivia
const OLIVIA_PRODUCTS = {
  premium: {
    name: 'Olivia Premium',
    price: 1999, // 19,99€ en centimes
    currency: 'eur',
    interval: 'month',
    features: [
      'Conversations illimitées',
      'Accès aux exercices avancés',
      'Voyages sonores personnalisés',
      'Programmes anti-stress',
      'Support prioritaire'
    ],
    stripe_price_id: process.env.STRIPE_PREMIUM_PRICE_ID
  },
  therapy: {
    name: 'Olivia Thérapie',
    price: 3999, // 39,99€ en centimes
    currency: 'eur',
    interval: 'month',
    features: [
      'Tout Olivia Premium inclus',
      'Préparation de séances thérapeutiques',
      'Outils thérapeutiques avancés',
      'Analyses comportementales',
      'Support thérapeutique dédié',
      'Connexion praticiens partenaires'
    ],
    stripe_price_id: process.env.STRIPE_THERAPY_PRICE_ID
  }
};

// Créer ou récupérer un client Stripe
const getOrCreateCustomer = async (userEmail, userName) => {
  try {
    // Rechercher un client existant
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Créer un nouveau client
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        source: 'olivia_app'
      }
    });

    return customer;
  } catch (error) {
    console.error('Erreur création/récupération client Stripe:', error);
    throw error;
  }
};

// Créer une session de checkout
const createCheckoutSession = async (customerId, priceId, planType, successUrl, cancelUrl) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan_type: planType,
        source: 'olivia_app'
      },
      subscription_data: {
        metadata: {
          plan_type: planType,
          source: 'olivia_app'
        }
      }
    });

    return session;
  } catch (error) {
    console.error('Erreur création session checkout:', error);
    throw error;
  }
};

// Créer un portail de gestion d'abonnement
const createCustomerPortalSession = async (customerId, returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error('Erreur création portail client:', error);
    throw error;
  }
};

// Récupérer les détails d'un abonnement
const getSubscriptionDetails = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    throw error;
  }
};

// Annuler un abonnement
const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    return subscription;
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    throw error;
  }
};

// Réactiver un abonnement
const reactivateSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });
    return subscription;
  } catch (error) {
    console.error('Erreur réactivation abonnement:', error);
    throw error;
  }
};

module.exports = {
  stripe,
  OLIVIA_PRODUCTS,
  getOrCreateCustomer,
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscriptionDetails,
  cancelSubscription,
  reactivateSubscription
};