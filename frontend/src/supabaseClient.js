// src/supabaseClient.js (maintenant utilisé pour Google Auth)
// Fichier de compatibilité pour remplacer Supabase par Google Auth
import { googleAuth, auth } from './services/googleAuth.js';

console.log("Service d'authentification Google initialisé");

// Initialiser le service
googleAuth.init();

// Export pour compatibilité avec l'ancien code Supabase
export const supabase = {
  auth: auth
};

// Export direct du service Google Auth
export { googleAuth };