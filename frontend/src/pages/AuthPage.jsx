// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Importe ton client Supabase
import '../styles/_authPage.scss';
// import GoogleLogo from '../../public/Google_icon-icons.com_66793.png'
import { LogIn, UserPlus, Lock, Mail } from 'lucide-react';
// ... (ton composant GoogleIcon reste le même) ...



const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        // options: { // Optionnel : pour rediriger vers une page spécifique après la connexion
        //   redirectTo: window.location.origin + '/home', // ou une autre route de ton app
        // }
      });

      if (signInError) {
        throw signInError;
      }
      
      // Supabase gère la redirection vers Google et le retour.
      // Si redirectTo n'est pas spécifié, il revient à la page actuelle.
      // La session utilisateur sera disponible via supabase.auth.getSession() ou supabase.auth.onAuthStateChange
      // après le retour de Google. Tu géreras la redirection vers '/home' dans un useEffect global
      // qui écoute les changements d'état d'authentification.
      console.log("Redirection vers Google pour authentification...", data);
      // Pas besoin de naviguer ici, Supabase s'en charge.

    } catch (err) {
      console.error("Erreur Google Sign-In Supabase:", err);
      setError(err.message || "Impossible de se connecter avec Google. Veuillez réessayer.");
    }
    // setLoading(false); // Le setLoading sera géré par la redirection ou l'erreur
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
      let authResponse;
      if (isLoginView) { // Connexion
        authResponse = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      } else { // Inscription
        authResponse = await supabase.auth.signUp({
          email: email,
          password: password,
          // options: { // Optionnel: pour ajouter des métadonnées utilisateur à l'inscription
          //   data: { 
          //     full_name: 'Nom Prénom', // Exemple
          //   }
          // }
        });
      }

      const { data, error: authError } = authResponse;

      if (authError) {
        throw authError;
      }

      // Pour l'inscription, Supabase envoie un email de confirmation par défaut.
      // L'utilisateur ne sera pas immédiatement connecté.
      if (!isLoginView && data.user && data.session === null) {
        alert("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
        // Tu peux rediriger vers une page "Vérifiez votre email" ou rester ici.
      } else if (data.user && data.session) {
        console.log(isLoginView ? "Utilisateur connecté:" : "Utilisateur inscrit et connecté (si confirmation désactivée):", data.user);
        navigate('/home'); // Redirige vers le tableau de bord
      } else if (!isLoginView) {
          // Cas où l'inscription est réussie mais nécessite une confirmation par email (comportement par défaut)
          alert("Inscription presque terminée ! Veuillez consulter votre boîte mail pour confirmer votre adresse e-mail.");
          // Peut-être effacer les champs ou rediriger vers une page d'attente de confirmation
          setEmail('');
          setPassword('');
          setConfirmPassword('');
      }

    } catch (err) {
      console.error("Erreur Email/Password Supabase:", err);
      setError(err.message || "Une erreur s'est produite. Vérifiez vos identifiants ou réessayez.");
    }
    setLoading(false);
  };

  // Tu auras besoin d'un useEffect dans ton composant App.js (ou un composant parent)
  // pour écouter les changements d'état d'authentification et rediriger l'utilisateur
  // après une connexion réussie (surtout pour OAuth avec Google).
  // Exemple (à mettre dans App.js):
  // useEffect(() => {
  //   const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  //     if (event === 'SIGNED_IN' && session) {
  //       console.log('Utilisateur connecté via onAuthStateChange:', session.user);
  //       // setUser(session.user); // Mettre à jour un état global de l'utilisateur
  //       // navigate('/home'); // Rediriger ici si nécessaire
  //     } else if (event === 'SIGNED_OUT') {
  //       // setUser(null);
  //       // navigate('/auth');
  //     }
  //   });
  //   return () => {
  //     authListener.subscription.unsubscribe();
  //   };
  // }, [navigate]);


  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ... (Header, bouton Google, divider restent les mêmes visuellement) ... */}
        <div className="auth-header">
          <h1>{isLoginView ? "Bon Retour !" : "Créer un Compte"}</h1>
          <p>
            {isLoginView 
              ? "Connectez-vous pour accéder à votre espace." 
              : "Rejoignez-nous pour commencer votre parcours."}
          </p>
        </div>

        <button className="btn btn--google" onClick={handleGoogleSignIn} disabled={loading}>
          <img src="" alt="" />
          Continuer avec Google
        </button>

        <div className="auth-divider"><span>OU</span></div>

        <form onSubmit={handleSubmitEmailPassword} className="auth-form">
            {/* ... (Champs email, password, confirmPassword, message d'erreur) ... */}
            {/* ... Bouton de soumission ... */}
            {/* ... Auth switcher ... */}
            {/* ... Lien mot de passe oublié ... */}
             <div className="form-group">
                <label htmlFor="email"><Mail size={16}/> Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votreadresse@email.com"/>
            </div>
            <div className="form-group">
                <label htmlFor="password"><Lock size={16}/> Mot de passe</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="********"/>
            </div>
            {!isLoginView && (
                <div className="form-group">
                <label htmlFor="confirmPassword"><Lock size={16}/> Confirmer le mot de passe</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="********"/>
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
        {isLoginView && <Link to="/mot-de-passe-oublie" className="forgot-password-link">Mot de passe oublié ?</Link>}

      </div>
    </div>
  );
};

export default AuthPage;