// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { authenticateUser } = require('../middleware/premiumMiddleware');

// Connexion/inscription via Google
router.post('/google-signin', async (req, res) => {
  try {
    const { googleUserData } = req.body;
    
    if (!googleUserData || !googleUserData.id || !googleUserData.email) {
      return res.status(400).json({ error: 'Données utilisateur Google invalides' });
    }

    // Créer ou récupérer l'utilisateur
    const user = await userService.getOrCreateUser(googleUserData);
    
    // Générer un token simple (dans un vrai système, utiliser JWT)
    const token = user.google_id; // Simplifié pour la démo
    
    // Informations de réponse
    const userResponse = {
      id: user.id,
      google_id: user.google_id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      subscription_type: user.subscription_type,
      subscription_status: user.subscription_status
    };

    res.json({
      user: userResponse,
      token,
      subscription: await userService.getSubscriptionInfo(user.google_id)
    });
  } catch (error) {
    console.error('Erreur authentification Google:', error);
    res.status(500).json({ error: 'Erreur lors de l\'authentification' });
  }
});

// Vérifier le token et récupérer l'utilisateur
router.get('/verify', authenticateUser, async (req, res) => {
  try {
    const subscriptionInfo = await userService.getSubscriptionInfo(req.user.google_id);
    
    const userResponse = {
      id: req.user.id,
      google_id: req.user.google_id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      subscription_type: req.user.subscription_type,
      subscription_status: req.user.subscription_status
    };

    res.json({
      user: userResponse,
      subscription: subscriptionInfo,
      valid: true
    });
  } catch (error) {
    console.error('Erreur vérification token:', error);
    res.status(401).json({ error: 'Token invalide', valid: false });
  }
});

// Déconnexion
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // Dans un vrai système, on invaliderait le token JWT ici
    // Pour la démo, on ne fait rien côté serveur
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

// Mettre à jour le profil utilisateur
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const updatedUser = await userService.updateUser(req.user.google_id, {
      preferences: {
        ...req.user.preferences,
        ...preferences
      }
    });

    res.json({
      message: 'Profil mis à jour',
      preferences: updatedUser.preferences
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

module.exports = router;