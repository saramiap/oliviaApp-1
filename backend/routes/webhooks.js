// backend/routes/webhooks.js
const express = require('express');
const router = express.Router();
const stripeConfig = require('../config/stripe');
const userService = require('../services/userService');

// Middleware pour traiter les webhooks Stripe (raw body nécessaire)
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// Webhook Stripe pour synchroniser les abonnements
router.post('/stripe', rawBodyMiddleware, async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeConfig.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur vérification webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Traiter les différents événements Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completée:', session.id);
        
        // Récupérer l'abonnement si c'est un paiement de subscription
        if (session.mode === 'subscription') {
          const subscription = await stripeConfig.stripe.subscriptions.retrieve(session.subscription);
          await handleSubscriptionCreated(session, subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Abonnement mis à jour:', subscription.id);
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Abonnement supprimé:', subscription.id);
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Paiement facture réussi:', invoice.id);
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Échec paiement facture:', invoice.id);
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log('Événement Stripe non géré:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur traitement webhook Stripe:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
});

// Gérer la création d'un abonnement
async function handleSubscriptionCreated(session, subscription) {
  try {
    const customer = await stripeConfig.stripe.customers.retrieve(session.customer);
    const user = await userService.getUserByEmail(customer.email);
    
    if (!user) {
      console.error('Utilisateur non trouvé pour email:', customer.email);
      return;
    }

    const planType = session.metadata?.plan_type || 'premium';
    
    const subscriptionData = {
      type: planType,
      status: subscription.status,
      stripe_customer_id: session.customer,
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000)
    };

    await userService.updateSubscription(user.google_id, subscriptionData);
    
    // Track successful conversion
    await userService.trackEvent('subscription_created', user.id, {
      plan_type: planType,
      subscription_id: subscription.id,
      amount: session.amount_total / 100
    });

    console.log('Abonnement créé avec succès pour:', user.email);
  } catch (error) {
    console.error('Erreur création abonnement:', error);
  }
}

// Gérer la mise à jour d'un abonnement
async function handleSubscriptionUpdated(subscription) {
  try {
    const customer = await stripeConfig.stripe.customers.retrieve(subscription.customer);
    const user = await userService.getUserByEmail(customer.email);
    
    if (!user) {
      console.error('Utilisateur non trouvé pour email:', customer.email);
      return;
    }

    // Déterminer le type de plan basé sur le prix
    let planType = 'premium';
    if (subscription.items.data[0]?.price?.id === process.env.STRIPE_THERAPY_PRICE_ID) {
      planType = 'therapy';
    }

    const subscriptionData = {
      type: planType,
      status: subscription.status,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000)
    };

    await userService.updateSubscription(user.google_id, subscriptionData);
    
    console.log('Abonnement mis à jour pour:', user.email);
  } catch (error) {
    console.error('Erreur mise à jour abonnement:', error);
  }
}

// Gérer la suppression d'un abonnement
async function handleSubscriptionDeleted(subscription) {
  try {
    const customer = await stripeConfig.stripe.customers.retrieve(subscription.customer);
    const user = await userService.getUserByEmail(customer.email);
    
    if (!user) {
      console.error('Utilisateur non trouvé pour email:', customer.email);
      return;
    }

    // Rétrograder vers le plan gratuit
    const subscriptionData = {
      type: 'free',
      status: 'cancelled',
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: null,
      current_period_start: null,
      current_period_end: null
    };

    await userService.updateSubscription(user.google_id, subscriptionData);
    
    // Track churn
    await userService.trackEvent('subscription_cancelled', user.id, {
      cancelled_at: new Date(),
      previous_plan: user.subscription_type
    });

    console.log('Abonnement supprimé pour:', user.email);
  } catch (error) {
    console.error('Erreur suppression abonnement:', error);
  }
}

// Gérer le succès d'un paiement
async function handlePaymentSucceeded(invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripeConfig.stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripeConfig.stripe.customers.retrieve(subscription.customer);
      const user = await userService.getUserByEmail(customer.email);
      
      if (user) {
        await userService.trackEvent('payment_succeeded', user.id, {
          amount: invoice.amount_paid / 100,
          invoice_id: invoice.id,
          subscription_id: subscription.id
        });
      }
    }
  } catch (error) {
    console.error('Erreur traitement paiement réussi:', error);
  }
}

// Gérer l'échec d'un paiement
async function handlePaymentFailed(invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripeConfig.stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripeConfig.stripe.customers.retrieve(subscription.customer);
      const user = await userService.getUserByEmail(customer.email);
      
      if (user) {
        // Mettre à jour le statut
        await userService.updateUser(user.google_id, {
          subscription_status: 'past_due'
        });

        await userService.trackEvent('payment_failed', user.id, {
          amount: invoice.amount_due / 100,
          invoice_id: invoice.id,
          subscription_id: subscription.id,
          attempt_count: invoice.attempt_count
        });
      }
    }
  } catch (error) {
    console.error('Erreur traitement échec paiement:', error);
  }
}

module.exports = router;