// src/App.js
import React, { useEffect /* useState si tu gères l'état utilisateur ici */ } from 'react';
// Assure-toi que BrowserRouter est importé pour envelopper tes routes
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './styles/main.scss';

// Tes imports de pages et composants
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Detente from './pages/Detente';
import Podcast from './pages/Podcast';
import Navbar from './components/Navbar';
import './App.css'; // Tes styles globaux
// import Home from './components/Home'; // Commente si DashboardPage est utilisé pour /home
import Footer from './components/Footer';
import ProfileSelect from './pages/ProfileSelect';
import Sante from './pages/Sante';
import StressProgramPage from './pages/StressProgramPage';
import Urgence from './pages/Urgence';
import Journal from "./pages/Journal"; 
import PreparerSeance from './pages/PreparerSeance';
import Settings from './pages/Settings';
import SoundJourney from './pages/SoundJourney'; // Renommé depuis SoundJourneyPage pour cohérence
import YogaProgram from './pages/YogaProgram';   // Renommé depuis YogaProgramPage
import UnderstandingStress from './pages/UnderstandingStress'; // Renommé
import Dashboard from './pages/Dashboard'; // Renommé depuis Dashboard pour être plus explicite
import AuthPage from './pages/AuthPage';
import Logout from './pages/Logout';

// Importe le service d'authentification Google
import { supabase } from './supabaseClient'; // Maintenant utilise Google Auth

// Ce composant contiendra la logique qui a besoin de `useNavigate`
// et sera rendu à l'intérieur du <Router>
function AppContent() {
  const navigate = useNavigate(); // useNavigate peut être utilisé ici
  // const [user, setUser] = useState(null); // Optionnel : pour gérer l'état utilisateur globalement

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // setUser(session.user);
        console.log('Session initiale, utilisateur connecté:', session.user);
        // Si l'utilisateur est sur /auth et qu'il a une session, on le redirige vers dashboard
        if (window.location.pathname === '/auth') {
         navigate('/?welcome=true'); // Redirection vers dashboard avec paramètre welcome
        }
      } else {
        // setUser(null);
        console.log('Aucune session initiale.');
        // Si pas de session et pas sur /auth, rediriger vers /auth (sauf si c'est une page publique)
        // Cela dépend de ta logique de routes protégées
        // if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
        //    navigate('/auth');
        // }
      }
    };
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth event:', event, session);
      if (event === 'SIGNED_IN' && session) {
        // setUser(session.user);
        console.log('Utilisateur connecté via onAuthStateChange:', session.user);
        // Si l'utilisateur vient de se connecter (ex: depuis /auth), redirige-le vers dashboard
        if (window.location.pathname === '/auth') {
             navigate('/?welcome=true'); // Redirection vers dashboard avec message de bienvenue
        } else if (window.location.pathname.startsWith('/auth#access_token=')) { // Cas de retour OAuth Google
            navigate('/?welcome=true'); // Redirection vers dashboard avec message de bienvenue
        }
      } else if (event === 'SIGNED_OUT') {
        // setUser(null);
        console.log('Utilisateur déconnecté.');
        navigate('/auth');
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  return (
    <>
      <Navbar /> {/* Navbar peut avoir besoin d'infos sur l'état d'authentification */}
      <div className="page-container">
        <Routes>
          <Route path="/accueil" element={<ProfileSelect />} /> 
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Dashboard />} /> {/* Assure-toi d'utiliser le bon nom de composant */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/detente" element={<Detente />} />
          <Route path="/detente/programme" element={<StressProgramPage />} />
          <Route path="/detente/voyage-sonore" element={<SoundJourney />} />
          <Route path="/detente/programme-yoga" element={<YogaProgram />} />
          <Route path="/detente/comprendre-stress" element={<UnderstandingStress />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/sante" element={<Sante />} />
          <Route path="/preparer-seance" element={<PreparerSeance />} />
          <Route path="/urgence" element={<Urgence />} />
          <Route path="/parametres" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

// Le composant App principal enveloppe AppContent avec le Router
function App() {
  return (
    <Router> {/* BrowserRouter est introduit ici */}
      <AppContent />
    </Router>
  );
}

export default App;