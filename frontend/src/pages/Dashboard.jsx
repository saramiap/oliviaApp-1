

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/_dashboard.scss'; // Nouveau fichier SCSS
import { Zap, Headphones, BookText, Smile, Edit3, ArrowRight, Compass, HelpCircle } from 'lucide-react'; // Icônes
import { 
  getUserNameFromStorage, 
  getLastActivitiesFromStorage,
  getMoodSummaryFromStorage 
  // addActivityToStorage sera utilisé dans les pages d'activité elles-mêmes
} from '../utils/localStorageManager'; // Ajuste le chemin
// src/utils/localStorageManager.js (exemple)



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

  const [lastActivities, setLastActivities] = useState(mockLastActivities);
  const [oliviaSuggestion, setOliviaSuggestion] = useState(mockOliviaSuggestion);
  const [moodSummary, setMoodSummary] = useState(mockMoodSummary);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [cardsVisible, setCardsVisible] = useState(false); // Pour l'animation d'apparition
const [userName, setUserName] = useState(''); 
  const navigate = useNavigate();

 useEffect(() => {
    // --- Chargement des Données depuis localStorage ---
    const loadedUserName = getUserNameFromStorage();
    setUserName(loadedUserName);
    setLastActivities(getLastActivitiesFromStorage());
    setMoodSummary(getMoodSummaryFromStorage());

    // --- Message de Bienvenue et Suggestion d'Olivia ---
    const timeOfDay = new Date().getHours();
    let greeting = "Bonjour";
    if (timeOfDay < 12) greeting = "Bonjour";
    else if (timeOfDay < 18) greeting = "Bon après-midi";
    else greeting = "Bonsoir";
    const oliviaTips = [ /* ... */ ];
    const randomTip = oliviaTips[Math.floor(Math.random() * oliviaTips.length)];
    setWelcomeMessage(`${greeting} ${userName} ! Olivia vous suggère : "${randomTip}"`);
    // Pour la suggestion d'Olivia, tu ferais idéalement un appel API ici
    // Pour l'instant, on garde le mock mais on l'intègre au message de bienvenue.
    // setWelcomeMessage(`${greeting} ${loadedUserName} ! ${oliviaSuggestion.description}`);
    // Ou si tu veux séparer le message d'accueil du conseil:
    setWelcomeMessage(`${greeting} ${loadedUserName} ! Prêt·e pour une journée plus sereine ?`);


    // Animation des cartes
    const timer = setTimeout(() => {
      setCardsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []); // Se déclenche une seule fois au montage



  // Définition des sections de l'application pour la carte d'introduction
  const appSections = [
    { name: "Espace Détente", description: "Explorez des voyages sonores, des programmes de yoga et des exercices de respiration pour vous relaxer.", icon: <Headphones size={20}/>, link: "/detente" },
    { name: "Dialogue avec Olivia", description: "Discutez avec Olivia, votre IA de soutien, pour explorer vos pensées et émotions.", icon: <BookText size={20}/>, link: "/chat" },
    { name: "Préparer ma Séance", description: "Structurez vos idées et émotions avant vos consultations professionnelles.", icon: <Edit3 size={20}/>, link: "/preparer-seance" },
    { name: "Mon Journal", description: "Un espace personnel pour écrire librement et suivre votre parcours.", icon: <Smile size={20}/>, link: "/journal" }, // Icône à adapter
  ];
     const iconMap = { // Exemple pour getActivityIcon
    Headphones: <Headphones size={20}/>,
    Zap: <Zap size={20}/>,
    Edit3: <Edit3 size={20}/>,
    BookText: <BookText size={20}/>,
    Smile: <Smile size={20}/>,
    Compass: <Compass size={20} />,
    HelpCircle: <HelpCircle size={20} />,
  };
 // Helper pour rendre les icônes des activités récentes dynamiquement
const getActivityIcon = (activity) => {
  if (activity.iconName && iconMap[activity.iconName]) {
    return iconMap[activity.iconName];
  }
    const sectionIcon = appSections.find(s => s.name.toLowerCase().includes(activity.type.toLowerCase()))?.icon;
      if (activity.type.toLowerCase().includes('sonore') || activity.type.toLowerCase().includes('podcast')) return <Headphones size={20}/>;
    if (sectionIcon) return React.cloneElement(sectionIcon, {size: 20});

    // Icônes par défaut basées sur le type d'activité stocké
    if (activity.type.toLowerCase().includes('sonore') || activity.type.toLowerCase().includes('podcast')) return <Headphones size={20}/>;
    if (activity.type.toLowerCase().includes('stress') || activity.type.toLowerCase().includes('respiration')) return <Zap size={20}/>;
    if (activity.type.toLowerCase().includes('journal')) return <Edit3 size={20}/>;
    if (activity.type.toLowerCase().includes('séance')) return <BookText size={20}/>;
    return <HelpCircle size={20} />; // Icône par défaut
  };


  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Mon Espace Bien-être</h1>
        <p className="dashboard-welcome-message">{welcomeMessage}</p>
      </header>

      {/* Nouvelle Section d'Introduction */}
      <section className={`dashboard-card card-introduction ${cardsVisible ? 'visible' : ''}`}>
        <div className="card-icon-top"><Compass size={32} /></div>
        <h2>Bienvenue sur Sérenis!</h2>
        <p>
          Nous sommes ravis de vous accompagner dans votre parcours vers un meilleur équilibre mental. 
          Voici un aperçu de ce que vous pouvez explorer :
        </p>
        <ul className="intro-sections-list">
            {appSections.map(section => (
                <li key={section.name}>
                    <Link to={section.link} className="intro-section-link">
                        <span className="intro-section-icon">{section.icon}</span>
                        <div className="intro-section-text">
                            <strong>{section.name}</strong>
                            <span>{section.description}</span>
                        </div>
                        <ArrowRight size={18} className="item-arrow"/>
                    </Link>
                </li>
            ))}
        </ul>
        <p className="intro-tip">
            N'hésitez pas à commencer par ce qui vous attire le plus ou à demander conseil à Olivia dans le chat !
        </p>
      </section>

      <div className={`dashboard-grid ${cardsVisible ? 'visible' : ''}`}>
        
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


        {/* Section Explorer Plus */}
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