// import React from 'react';
// import ConstructionPage from '../components/ConstructionPage'; // Ajuste le chemin si besoin
// import { Mic  } from 'lucide-react';



// const Journal = () => {
//   // Pour l'instant, on affiche juste la page "en cours de création".
//   //décommenter et réutiliser ton code original quand la page sera prête.
  
//   return (
//     <ConstructionPage 
//       pageName="Journal" 
//       featureDescription="de nouveaux épisodes inspirants et relaxants"
//       IconComponent={Mic} // <<<< PASSE L'ICÔNE EN PROP
//     />
//   );
// };

// export default Journal;

import React, { useEffect, useState, useRef } from "react"; // Ajout de useRef
import "../styles/_journalLayout.scss"; // On va beaucoup modifier ce fichier
import { Menu, X } from "lucide-react"; // Icônes pour le bouton toggle

const Journal = () => {
  const [sessions, setSessions] = useState({});
  const [activeSession, setActiveSession] = useState("");
  const [input, setInput] = useState("");
  const [isHistoryVisible, setIsHistoryVisible] = useState(false); // Pour le toggle de l'historique
  const liveEntryRef = useRef(null); // Référence pour l'entrée en cours d'écriture

  useEffect(() => {
    const saved = localStorage.getItem("journalSessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      const today = new Date().toISOString().split("T")[0];
      if (Object.keys(parsed).length > 0) {
        // S'assurer qu'il y a des sessions
        setActiveSession(
          parsed[today]
            ? today
            : Object.keys(parsed).sort((a, b) => new Date(b) - new Date(a))[0]
        );
      }
    }
    // Sur les grands écrans, l'historique est visible par défaut
    if (window.innerWidth >= 768) {
      setIsHistoryVisible(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("journalSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Effet pour l'écriture manuscrite en temps réel (synchronisation)
  useEffect(() => {
    if (liveEntryRef.current) {
      liveEntryRef.current.textContent = input; // Met à jour le contenu de la div "page"
    }
  }, [input]); // Se déclenche à chaque changement de l'input

  const handleAddEntry = () => {
    if (!input.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const newEntry = {
      text: input,
      date: new Date().toISOString(),
    };

    const updatedSessions = {
      ...sessions,
      [today]: [...(sessions[today] || []), newEntry],
    };
    setSessions(updatedSessions);
    setActiveSession(today); // Assure que la nouvelle session devient active
    setInput(""); // Réinitialise l'input après l'ajout
  };

  const handleDeleteEntry = (sessionKey, index) => {
    const updatedSessions = { ...sessions }; // Crée une copie pour l'immutabilité
    updatedSessions[sessionKey].splice(index, 1);
    if (updatedSessions[sessionKey].length === 0) {
      delete updatedSessions[sessionKey];
      // Si la session active est supprimée et devient vide, on sélectionne la plus récente ou rien
      if (activeSession === sessionKey) {
        const remainingSessions = Object.keys(updatedSessions).sort(
          (a, b) => new Date(b) - new Date(a)
        );
        setActiveSession(
          remainingSessions.length > 0 ? remainingSessions[0] : ""
        );
      }
    }
    setSessions(updatedSessions);
  };

  // Fonction pour générer un résumé/titre (simple pour l'instant)
  const getEntryTitle = (text) => {
    if (!text) return "Nouvelle entrée";
    const words = text.split(/\s+/);
    return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
  };

  return (
    <div
      className={`journal-layout ${isHistoryVisible ? "history-visible" : ""}`}
    >
      {window.innerWidth < 768 && (
        <button
          className="journal-history-toggle"
          onClick={() => setIsHistoryVisible(!isHistoryVisible)}
          aria-label={
            isHistoryVisible ? "Cacher l'historique" : "Afficher l'historique"
          }
          aria-expanded={isHistoryVisible}
        >
          {isHistoryVisible ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <aside
        className={`journal-history-column ${
          isHistoryVisible ? "visible" : ""
        }`}
      >
        <h2 className="journal-history-title">Mes Entrées</h2>
        <ul className="journal-history-list">
          {Object.keys(sessions)
            .sort((a, b) => new Date(b) - new Date(a)) // Trie les sessions par date (plus récent en premier)
            .flatMap(
              (
                sessionKey // Utilise flatMap pour lister toutes les entrées individuellement
              ) =>
                sessions[sessionKey].map((entry, index) => ({
                  // Crée un objet par entrée avec sessionKey et index
                  id: `${sessionKey}-${index}`,
                  title: getEntryTitle(entry.text),
                  fullDate: new Date(entry.date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  sessionKey: sessionKey, // Garde la sessionKey pour l'activation
                  originalIndex: index, // Garde l'index original pour la suppression
                }))
            )
            .map((entryItem) => (
              <li
                key={entryItem.id}
                // Pour l'activation, on active la session parente.
                // On pourrait améliorer pour scroller jusqu'à l'entrée spécifique.
                className={`history-entry-item ${
                  activeSession === entryItem.sessionKey ? "active-session" : ""
                }`}
                onClick={() => {
                  setActiveSession(entryItem.sessionKey);
                  // Sur mobile, cacher l'historique après sélection
                  if (window.innerWidth < 768) setIsHistoryVisible(false);
                }}
              >
                <span className="history-entry-title">{entryItem.title}</span>
                <span className="history-entry-date">{entryItem.fullDate}</span>
              </li>
            ))}
          {Object.keys(sessions).length === 0 && (
            <li className="no-history-entries">
              Aucune entrée pour le moment.
            </li>
          )}
        </ul>
      </aside>

      <main className="journal-page-column">
        <div className="journal-notebook-paper">
          <header className="notebook-header">
            <h3 className="notebook-date">
              {activeSession
                ? new Date(activeSession).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Nouvelle Page"}
            </h3>
          </header>

          <div className="notebook-entries-display">
            {/* Affichage des entrées sauvegardées de la session active */}
            {sessions[activeSession]?.length > 0 &&
              sessions[activeSession].map((entry, index) => (
                <div key={index} className="notebook-entry-saved">
                  <p className="entry-text-saved">{entry.text}</p>
                  <div className="entry-meta-saved">
                    <small>
                      {new Date(entry.date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                    <button
                      className="delete-entry-btn"
                      onClick={() => handleDeleteEntry(activeSession, index)}
                      aria-label="Supprimer cette entrée"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

            {/* Zone pour l'écriture en temps réel (la "page" actuelle) */}
            {/* Cette div sera remplie par le useEffect basé sur `input` */}
            <div
              ref={liveEntryRef}
              className="notebook-live-entry"
              aria-live="polite"
            >
              {/* Le contenu de 'input' sera injecté ici via JavaScript */}
            </div>
          </div>
        </div>

        <footer className="journal-input-area">
          <textarea
            className="journal-textarea"
            placeholder="Écris ici tes pensées..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows="4" // Un peu plus de hauteur par défaut
          />
          <button
            className="journal-add-entry-btn"
            onClick={handleAddEntry}
            disabled={!input.trim()}
          >
            Ajouter à mon journal
          </button>
        </footer>
      </main>
    </div>
  );
};

export default Journal;
