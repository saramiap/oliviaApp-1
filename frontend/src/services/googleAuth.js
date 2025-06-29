// src/services/googleAuth.js
class GoogleAuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = [];
  }

  // Initialiser le service avec les données stockées
  init() {
    const storedUser = localStorage.getItem('olivia_user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        this.isAuthenticated = true;
        this.notifyListeners('SIGNED_IN', this.user);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('olivia_user');
      }
    }
  }

  // Ajouter un listener pour les changements d'état d'auth
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    // Retourner une fonction de cleanup
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notifier tous les listeners
  notifyListeners(event, user) {
    this.listeners.forEach(listener => {
      try {
        listener(event, user);
      } catch (error) {
        console.error('Erreur dans listener auth:', error);
      }
    });
  }

  // Connexion réussie depuis Google
  async signInSuccess(credentialResponse) {
    try {
      // Décoder le JWT token de Google (basique, sans vérification)
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        email_verified: payload.email_verified
      };

      this.user = user;
      this.isAuthenticated = true;
      
      // Sauvegarder dans localStorage
      localStorage.setItem('olivia_user', JSON.stringify(user));
      
      // Notifier les listeners
      this.notifyListeners('SIGNED_IN', user);
      
      return { user, error: null };
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      return { user: null, error };
    }
  }

  // Déconnexion
  async signOut() {
    try {
      this.user = null;
      this.isAuthenticated = false;
      
      // Nettoyer localStorage
      localStorage.removeItem('olivia_user');
      
      // Notifier les listeners
      this.notifyListeners('SIGNED_OUT', null);
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.user;
  }

  // Vérifier si l'utilisateur est connecté
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Obtenir la session (pour compatibilité avec l'ancien code Supabase)
  getSession() {
    return {
      data: {
        session: this.isAuthenticated ? {
          user: this.user,
          access_token: 'mock_token', // Pour compatibilité
        } : null
      }
    };
  }
}

// Instance singleton
export const googleAuth = new GoogleAuthService();

// API compatible avec Supabase pour faciliter la migration
export const auth = {
  getSession: () => googleAuth.getSession(),
  onAuthStateChange: (callback) => googleAuth.onAuthStateChange(callback),
  signOut: () => googleAuth.signOut()
};