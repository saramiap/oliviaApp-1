// src/layouts/JournalLayout.jsx
import React from "react";
import "../styles/_journalLayout.scss";
import { useNavigate } from "react-router-dom";

const JournalLayout = ({ children, entries, onDelete }) => {
  const navigate = useNavigate();
  
  return (
    <div className="journal-layout">
      <aside className="journal-sidebar">
      <button className="back-btn" onClick={() => navigate("/")}>
          ← Revenir au chat
        </button>
        <h2>📔 Mon Carnet</h2>
        {entries.length === 0 ? (
          <p>Aucune entrée pour l’instant.</p>
        ) : (
          <ul>
            {entries.map((entry, idx) => (
              <li key={idx}>
                <div>
                  <strong>{new Date(entry.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</strong>
                  <p>{entry.text.slice(0, 50)}...</p>
                </div>
                <button onClick={() => onDelete(idx)}>🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <main className="journal-content">{children}</main>
    </div>
  );
};

export default JournalLayout;
