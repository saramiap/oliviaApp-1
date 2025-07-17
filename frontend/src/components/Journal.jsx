
import React, { useState, useEffect } from "react";
import OliviaAvatar from "./OliviaAvatar";
import "../styles/_journal.scss";


const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [current, setCurrent] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [flip, setFlip] = useState(false);

  // Charger les entrées depuis le localStorage au chargement
  useEffect(() => {
    const saved = localStorage.getItem("journalEntries");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEntries(parsed);
        }
      } catch (e) {
        // Ignore si erreur
      }
    }
  }, []);

  // Sauvegarder les entrées à chaque modification
  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!current.trim()) return;
    const newEntry = { text: current, date: new Date() };
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    setCurrent("");
    setCurrentPage(0);
  };

  const handleSelectPage = (idx) => {
    if (idx === currentPage) return;
    setFlip(true);
    setTimeout(() => {
      setCurrentPage(idx);
      setFlip(false);
    }, 600); // Durée de l'animation CSS
  };

  return (
    <div className="journal-chatlike-layout">
      <div className="journal-avatar-header">
        <OliviaAvatar />
        <h2>Mon Carnet</h2>
        <p className="subtitle">Exprime-toi librement, Olivia ne répond pas ici.</p>
      </div>
      <div className="journal-main-col">
        <form onSubmit={handleSubmit} className="journal-form">
          <textarea
            className="journal-area"
            placeholder="Ce que je ressens en ce moment..."
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <button type="submit" className="journal-submit">
            ✍️ Ajouter
          </button>
        </form>
        <div className="journal-entries-list">
          {entries.length === 0 ? (
            <p className="empty">Aucune note encore...</p>
          ) : (
            <ul className="entry-list">
              {entries.map((entry, idx) => (
                <li
                  className={`entry${currentPage === idx ? " active" : ""}`}
                  key={idx}
                  onClick={() => handleSelectPage(idx)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="entry-title">
                    {entry.text.slice(0, 30)}
                    {entry.text.length > 30 ? "..." : ""}
                  </span>
                  <span className="entry-date">
                    {new Date(entry.date).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="journal-main-content">
          {entries.length > 0 ? (
            <div className={`journal-notebook-paper${flip ? " flip" : ""}`}>
              <h3>
                {entries[currentPage].text.slice(0, 40)}
                {entries[currentPage].text.length > 40 ? "..." : ""}
              </h3>
              <p>{entries[currentPage].text}</p>
              <small>
                {new Date(entries[currentPage].date).toLocaleString()}
              </small>
            </div>
          ) : (
            <div className="journal-notebook-paper empty">
              <p>Aucune note sélectionnée.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
