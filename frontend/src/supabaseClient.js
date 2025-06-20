// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
console.log("bonjour je passe");
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl); // Pour déboguer
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Chargée' : 'NON CHARGÉE'); // Pour déboguer, ne loggue pas la clé elle-même

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erreur: URL Supabase ou Clé Anonyme manquante. " +
    "Assure-toi qu'elles sont bien définies dans tes variables d'environnement .env " +
    "(avec le préfixe VITE_ pour les projets Vite) et que le serveur de développement a été redémarré."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);