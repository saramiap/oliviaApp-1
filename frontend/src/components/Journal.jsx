import React, { useState } from "react";
import "../styles/_journal.scss";

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [current, setCurrent] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!current.trim()) return;
    setEntries([{ text: current, date: new Date() }, ...entries]);
    setCurrent("");
  };

  return (
    <div className="journal-container">
      <h2>Mon Carnet</h2>
      <p className="subtitle">Exprime-toi librement, Olivia ne répond pas ici.</p>

      <form onSubmit={handleSubmit} className="journal-form">
        <textarea
          className="journal-area"
          placeholder="Ce que je ressens en ce moment..."
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <button type="submit" className="journal-submit">✍️ Ajouter</button>
      </form>

      <div className="history-wrapper">
        <div
          className="toggle-button"
          onClick={() => setShowHistory(!showHistory)}
        >
          📖 {showHistory ? "Fermer le livre" : "Ouvrir le livre"}
        </div>

        {showHistory && (
          <div className="history-book">
            {entries.length === 0 ? (
              <p className="empty">Aucune note encore...</p>
            ) : (
              entries.map((entry, idx) => (
                <div className="entry" key={idx}>
                  <div className="entry-content">
                    <p>{entry.text}</p>
                    <small>{new Date(entry.date).toLocaleString()}</small>
                  </div>
                  <button
                    className="delete-entry-btn"
                    onClick={() => {
                      const updatedEntries = entries.filter((_, index) => index !== idx);
                      setEntries(updatedEntries);
                    }}
                    title="Supprimer cette entrée"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
