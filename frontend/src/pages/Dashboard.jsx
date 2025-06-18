// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/_dashboard.scss'; // Nouveau fichier SCSS
import { Zap, Headphones, BookText, Smile, Edit3, ArrowRight } from 'lucide-react'; // Icônes

// Données simulées (à remplacer par de vraies données plus tard)
const mockUserData = {
  name: "Alex", // Ou récupérer le vrai nom de l'utilisateur connecté
};

const mockLastActivities = [
  { id: 'sound_journey_forest', type: 'Voyage Sonore', title: 'Forêt Sereine', route: '/detente/voyage-sonore', icon: <Headphones size={20}/>, progress: null },
  { id: 'stress_program_day3', type: 'Programme Anti-Stress', title: 'Jour 3 - Scan Corporel', route: '/detente/programme', icon: <Zap size={20}/>, progress: '3/7' },
  { id: 'journal_last', type: 'Journal', title: 'Votre dernière entrée', route: '/journal', icon: <Edit3 size={20}/>, progress: null },
];

const mockOliviaSuggestion = {
  type: 'exercice_respiration',
  title: 'Respiration Carrée (Box Breathing)',
  description: "Un exercice simple pour calmer l'esprit et réduire le stress en 4 étapes faciles.",
  actionText: "Essayer maintenant",
  actionLink: "/detente/exercice-respiration", // Tu créeras cette page/composant plus tard
  icon: <Zap size={24} />
};

const mockMoodSummary = { // Simule la dernière humeur enregistrée
  mood: "Content·e", // ou "Neutre", "Un peu triste", "Stressé·e"
  emoji: "😊",
  date: "Aujourd'hui", // ou la date du dernier enregistrement
};


const Dashboard = () => {
  const [userName, setUserName] = useState(mockUserData.name);
  const [lastActivities, setLastActivities] = useState(mockLastActivities);
  const [oliviaSuggestion, setOliviaSuggestion] = useState(mockOliviaSuggestion);
  const [moodSummary, setMoodSummary] = useState(mockMoodSummary); // À implémenter vraiment plus tard
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Simuler un message de bienvenue personnalisé d'Olivia
    // À terme, cela pourrait être un appel API à Olivia avec un prompt comme :
    // "Génère un message de bienvenue court et positif pour [userName] pour son tableau de bord, 
    // incluant un petit conseil général pour la journée (ex: prendre une pause, s'hydrater, sourire)."
    const timeOfDay = new Date().getHours();
    let greeting = "Bonjour";
    if (timeOfDay < 12) greeting = "Bonjour";
    else if (timeOfDay < 18) greeting = "Bon après-midi";
    else greeting = "Bonsoir";

    const oliviaTips = [
        "N'oubliez pas de prendre quelques instants pour respirer profondément aujourd'hui.",
        "Un petit moment de gratitude peut illuminer votre journée.",
        "Pensez à vous hydrater régulièrement, c'est bon pour le corps et l'esprit.",
        "Une courte marche peut faire des merveilles pour clarifier les idées.",
        "Souriez, même un petit peu, cela peut influencer positivement votre humeur."
    ];
    const randomTip = oliviaTips[Math.floor(Math.random() * oliviaTips.length)];

    setWelcomeMessage(`${greeting} ${userName} ! Olivia vous suggère : "${randomTip}"`);

    // Charger les vraies données utilisateur, dernières activités, etc. ici
    // Par exemple, depuis localStorage ou une API si l'utilisateur est connecté.
  }, [userName]);


  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Mon Espace Bien-être</h1>
        <p className="dashboard-welcome-message">{welcomeMessage}</p>
      </header>

      <div className="dashboard-grid">
        {/* Section Suggestion d'Olivia */}
        <section className="dashboard-card card-olivia-suggestion">
          <div className="card-icon-top">{oliviaSuggestion.icon || <Zap size={28} />}</div>
          <h2>Suggestion d'Olivia</h2>
          <h3>{oliviaSuggestion.title}</h3>
          <p>{oliviaSuggestion.description}</p>
          <Link to={oliviaSuggestion.actionLink} className="btn btn--primary">
            {oliviaSuggestion.actionText} <ArrowRight size={16} />
          </Link>
        </section>

        {/* Section Dernières Activités */}
        <section className="dashboard-card card-last-activities">
          <h2>Accès Rapides</h2>
          {lastActivities.length > 0 ? (
            <ul className="quick-access-list">
              {lastActivities.map(activity => (
                <li key={activity.id}>
                  <Link to={activity.route} className="quick-access-item">
                    <span className="item-icon">{activity.icon || <BookText size={20}/>}</span>
                    <div className="item-info">
                      <span className="item-type">{activity.type}</span>
                      <span className="item-title">{activity.title}</span>
                    </div>
                    {activity.progress && <span className="item-progress">{activity.progress}</span>}
                    <ArrowRight size={18} className="item-arrow"/>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Commencez à explorer l'application pour voir vos activités récentes ici.</p>
          )}
        </section>

        {/* Section Humeur (si implémentée) */}
        {moodSummary && (
          <section className="dashboard-card card-mood-summary">
             <div className="card-icon-top"><Smile size={28} /></div>
            <h2>Mon Humeur Récente</h2>
            <div className="mood-display">
                <span className="mood-emoji">{moodSummary.emoji}</span>
                <span className="mood-text">{moodSummary.mood}</span>
            </div>
            <p className="mood-date">Enregistré : {moodSummary.date}</p>
            <Link to="/journal/humeur" className="btn btn--secondary"> {/* Tu créeras cette route/page */}
              Suivre mon humeur
            </Link>
          </section>
        )}

        {/* Tu pourrais ajouter d'autres cartes ici : Objectifs, Statistiques, etc. */}
        <section className="dashboard-card card-explore">
          <h2>Explorer Plus</h2>
          <div className="explore-links">
            <Link to="/detente" className="explore-link">Espace Détente</Link>
            <Link to="/chat" className="explore-link">Discuter avec Olivia</Link>
            <Link to="/preparer-seance" className="explore-link">Préparer ma Séance</Link>
            <Link to="/journal" className="explore-link">Mon Journal</Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;