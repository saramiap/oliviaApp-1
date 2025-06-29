// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../services/googleAuth';
import '../styles/_authPage.scss';
import { LogIn, UserPlus, Lock, Mail } from 'lucide-react';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const { user, error: authError } = await googleAuth.signInSuccess(credentialResponse);
      
      if (authError) {
        throw authError;
      }
      
      console.log('Utilisateur connecté avec Google:', user);
      // La navigation sera gérée par le useEffect dans App.jsx qui écoute les changements d'auth
      navigate('/');
      
    } catch (err) {
      console.error("Erreur Google Sign-In:", err);
      setError(err.message || "Impossible de se connecter avec Google. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Erreur lors de la connexion Google. Veuillez réessayer.");
  };

  const handleSubmitEmailPassword = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!isLoginView && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      // Pour le moment, on simule l'authentification email/password
      // Vous pouvez implémenter votre propre backend d'authentification ici
      if (isLoginView) {
        // Simulation de connexion
        if (email && password) {
          // Créer un utilisateur simulé
          const mockUser = {
            id: 'email_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            picture: null,
            given_name: email.split('@')[0],
            family_name: '',
            email_verified: true,
            auth_method: 'email'
          };
          
          // Sauvegarder dans le service d'auth
          googleAuth.user = mockUser;
          googleAuth.isAuthenticated = true;
          localStorage.setItem('olivia_user', JSON.stringify(mockUser));
          googleAuth.notifyListeners('SIGNED_IN', mockUser);
          
          navigate('/');
        } else {
          throw new Error("Email et mot de passe requis");
        }
      } else {
        // Simulation d'inscription
        if (email && password) {
          const mockUser = {
            id: 'email_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            picture: null,
            given_name: email.split('@')[0],
            family_name: '',
            email_verified: true,
            auth_method: 'email'
          };
          
          googleAuth.user = mockUser;
          googleAuth.isAuthenticated = true;
          localStorage.setItem('olivia_user', JSON.stringify(mockUser));
          googleAuth.notifyListeners('SIGNED_IN', mockUser);
          
          navigate('/');
        } else {
          throw new Error("Email et mot de passe requis");
        }
      }

    } catch (err) {
      console.error("Erreur Email/Password:", err);
      setError(err.message || "Une erreur s'est produite. Vérifiez vos identifiants ou réessayez.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLoginView ? "Bon Retour !" : "Créer un Compte"}</h1>
          <p>
            {isLoginView 
              ? "Connectez-vous pour accéder à votre espace." 
              : "Rejoignez-nous pour commencer votre parcours."}
          </p>
        </div>

        <div className="google-auth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            text={isLoginView ? "signin_with" : "signup_with"}
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div className="auth-divider"><span>OU</span></div>

        <form onSubmit={handleSubmitEmailPassword} className="auth-form">
             <div className="form-group">
                <label htmlFor="email"><Mail size={16}/> Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="votreadresse@email.com"
                />
            </div>
            <div className="form-group">
                <label htmlFor="password"><Lock size={16}/> Mot de passe</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="********"
                />
            </div>
            {!isLoginView && (
                <div className="form-group">
                <label htmlFor="confirmPassword"><Lock size={16}/> Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="********"
                />
                </div>
            )}
            {error && <p className="auth-error-message">{error}</p>}
            <button type="submit" className="btn btn--primary btn--submit" disabled={loading}>
                {loading ? "Chargement..." : (isLoginView ? <><LogIn size={18}/> Se Connecter</> : <><UserPlus size={18}/> S'inscrire</>)}
            </button>
        </form>

        <div className="auth-switcher">
          {isLoginView ? (
            <p>Pas encore de compte ? <button type="button" onClick={() => {setIsLoginView(false); setError('');}}>Inscrivez-vous</button></p>
          ) : (
            <p>Déjà un compte ? <button type="button" onClick={() => {setIsLoginView(true); setError('');}}>Connectez-vous</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;