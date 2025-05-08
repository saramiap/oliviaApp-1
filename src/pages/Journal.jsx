import { useEffect, useState } from "react";
import "../styles/_journalLayout.scss";

const Journal = () => {
  const [sessions, setSessions] = useState({});
  const [activeSession, setActiveSession] = useState("");
  const [input, setInput] = useState("");

  // Chargement depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("journalSessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      const today = new Date().toISOString().split("T")[0];
      setActiveSession(parsed[today] ? today : Object.keys(parsed)[0]);
    }
  }, []);

  // Sauvegarde
  useEffect(() => {
    localStorage.setItem("journalSessions", JSON.stringify(sessions));
  }, [sessions]);

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
    setActiveSession(today);
    setInput("");
  };

  const handleDeleteEntry = (sessionKey, index) => {
    const updated = { ...sessions };
    updated[sessionKey].splice(index, 1);
    if (updated[sessionKey].length === 0) delete updated[sessionKey];
    setSessions(updated);
  };

  return (
    <div className="journal-layout">
      <aside className="journal-sidebar">
        <h2>📖 Mon carnet</h2>
        <ul>
          {Object.keys(sessions)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((sessionKey) => (
              <li
                key={sessionKey}
                className={activeSession === sessionKey ? "active" : ""}
                onClick={() => setActiveSession(sessionKey)}
              >
                {new Date(sessionKey).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </li>
            ))}
        </ul>
      </aside>

      <div className="journal-content">
        <div className="journal-entries">
          <h3>
            {activeSession
              ? new Date(activeSession).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Aucune entrée"}
          </h3>
          {sessions[activeSession]?.length > 0 ? (
            sessions[activeSession].map((entry, index) => (
              <div key={index} className="entry">
                <p>{entry.text}</p>
                <small>
                  {new Date(entry.date).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteEntry(activeSession, index)}
                >
                  Supprimer
                </button>
              </div>
            ))
          ) : (
            <p>Aucune note pour cette journée.</p>
          )}
        </div>

        <div className="journal-input-wrapper">
          <div className="chat-input">
          <textarea className="input-chat"
            placeholder="Exprime-toi librement ici..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <button onClick={handleAddEntry}>📨</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;