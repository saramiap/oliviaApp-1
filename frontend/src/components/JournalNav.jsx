// src/components/JournalNav.jsx
import React from 'react';
import { BookOpen } from 'lucide-react'; // Utilisons une icône pertinente

// Fonction utilitaire pour générer un titre/résumé
const getEntryTitle = (text) => {
  if (!text) return "Nouvelle entrée";
  const words = text.split(/\s+/);
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
};

const JournalNav = ({ sessions, activeSession, setActiveSession, userProfileAvatar }) => {
  // Transformation des données pour un affichage simple
  const entryList = Object.keys(sessions)
    .sort((a, b) => new Date(b) - new Date(a)) // Trie les sessions par date
    .flatMap(sessionKey => 
      sessions[sessionKey].map((entry, index) => ({
        id: `${sessionKey}-${index}`,
        title: getEntryTitle(entry.text),
        fullDate: new Date(entry.date).toLocaleDateString("fr-FR", { month: 'long', day: 'numeric' }),
        sessionKey: sessionKey,
      }))
    );

  return (
    <div className="journal-navigation-content">
      <div className="journal-nav-header">
        <img src={userProfileAvatar || "/images/default-avatar.png"} alt="Mon profil" className="profile-avatar-display"/>
        <h2>📖 Mon Carnet</h2>
      </div>

      <div className="journal-history-list">
        {entryList.length === 0 ? (
          <div className="no-history-entries">
            <BookOpen size={32} />
            <p>Aucune entrée pour le moment.</p>
          </div>
        ) : (
          <ul>
            {entryList.map((entryItem) => (
              <li
                key={entryItem.id}
                className={`history-entry-item ${activeSession === entryItem.sessionKey ? "active-session" : ""}`}
                onClick={() => setActiveSession(entryItem.sessionKey)}
                title={entryItem.title}
              >
                <span className="history-entry-title">{entryItem.title}</span>
                <span className="history-entry-date">{entryItem.fullDate}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JournalNav;