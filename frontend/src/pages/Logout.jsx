// src/pages/Logout.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { googleAuth } from '../services/googleAuth';

const Logout = () => {
  useEffect(() => {
    const performLogout = async () => {
      try {
        await googleAuth.signOut();
        console.log('🔓 Déconnexion réussie depuis la page logout');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    };

    performLogout();
  }, []);

  // Redirection immédiate vers la page d'authentification
  return <Navigate to="/auth" replace />;
};

export default Logout;