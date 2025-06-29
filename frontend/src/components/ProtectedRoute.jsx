// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { googleAuth } from '../services/googleAuth';

const ProtectedRoute = ({ children, redirectTo = '/auth' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Vérifier l'état d'authentification
    const checkAuth = () => {
      const authenticated = googleAuth.isUserAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    // Vérification initiale
    checkAuth();

    // Écouter les changements d'authentification
    const unsubscribe = googleAuth.onAuthStateChange((event, user) => {
      if (event === 'SIGNED_IN' && user) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers l'authentification si non connecté
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Afficher le contenu protégé
  return children;
};

export default ProtectedRoute;