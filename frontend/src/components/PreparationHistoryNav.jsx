// src/components/PreparationHistoryNav.jsx

import React from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';

const PreparationHistoryNav = ({ preparations, activeId, onNew, onLoad, onDelete }) => {
  return (
    <aside className="prepare-session__sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar__title">Mes Préparations</h2>
        <button className="btn btn--new-prep" onClick={onNew}>
          <Plus size={18} /> Nouvelle Préparation
        </button>
      </div>
      
      <div className="history-list">
        {preparations.length === 0 ? (
          <div className="no-history">
            <BookOpen size={32} />
            <p>Aucune préparation sauvegardée.</p>
          </div>
        ) : (
          preparations.map(prep => (
            <div
              key={prep.id}
              className={`history-item ${prep.id === activeId ? 'active' : ''}`}
              onClick={() => onLoad(prep.id)}
            >
              <div className="history-item-content">
                <span className="history-item-title">{prep.title}</span>
                <span className="history-item-date">
                  {new Date(prep.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Empêche le onLoad de se déclencher
                  onDelete(prep.id);
                }}
                title="Supprimer cette préparation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default PreparationHistoryNav;