// src/components/JournalContent.jsx
import React, { useRef, useEffect, useMemo } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  FilePlus2,
} from "lucide-react";

const ENTRIES_PER_PAGE = 5;
const JournalContent = ({
  sessions,
  activeSession,
  journalInput,
  setJournalInput,
  handleAddEntry,
  handleDeleteEntry,
  goToNextDay,
  goToPreviousDay,
  sortedSessionKeys,
  animationDirection,
  activePageIndex,
  setActivePageIndex,
  addNewPage,
}) => {
  const liveEntryRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];
  const currentIndex = sortedSessionKeys.indexOf(activeSession);

  // Logique simplifiée pour activer/désactiver les boutons
  const hasPrevious = currentIndex > 0;
  const hasNext =
    activeSession < today ||
    (currentIndex < sortedSessionKeys.length - 1 &&
      sortedSessionKeys.length > 0);

  useEffect(() => {
    if (liveEntryRef.current) {
      liveEntryRef.current.textContent = journalInput;
    }
  }, [journalInput]);
  // On calcule les entrées pour la page actuelle et le nombre total de pages
  const { entriesForThisPage, totalPages } = useMemo(() => {
    const allEntries = sessions[activeSession] || [];
    const total = Math.ceil(allEntries.length / ENTRIES_PER_PAGE) || 1; // Au moins 1 page
    const startIndex = activePageIndex * ENTRIES_PER_PAGE;
    const endIndex = startIndex + ENTRIES_PER_PAGE;
    return {
      entriesForThisPage: allEntries.slice(startIndex, endIndex),
      totalPages: total,
    };
  }, [sessions, activeSession, activePageIndex]);

  // La `key` de l'animation doit maintenant inclure l'index de la page
  const animationKey = `${activeSession}-${activePageIndex}`;

  return (
    // Ce div englobe tout, y compris les flèches
    <div className="journal-layout">
      <button
        className="journal-nav-button prev"
        onClick={goToPreviousDay}
        disabled={!hasPrevious}
        title="Page précédente"
      >
        <ChevronLeft size={32} />
      </button>
      <main
        key={activeSession || "new-page"} // Ajout d'une clé de secours
        className={`journal-page-column page-turn-${animationDirection}`}
      >
        <div className="journal-notebook-paper">
          <div className="notebook-title-wrapper">
            <h3>Journal Intime</h3>
          </div>
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
            {entriesForThisPage.map((entry, index) => (
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
                    title="Supprimer cette entrée"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {/* Zone pour l'écriture en temps réel */}
            <div
              ref={liveEntryRef}
              className="notebook-live-entry"
              aria-live="polite"
            />
          </div>
        </div>

     {/* Pied de page du journal avec navigation de page et nouveau bouton */}
        <footer className="journal-page-footer">
          <div className="page-number">
            Page {activePageIndex + 1} / {totalPages}
          </div>
          <button className="new-page-btn" onClick={addNewPage} title="Ajouter une nouvelle page">
            <FilePlus2 size={20}/>
            <span>Nouvelle page</span>
          </button>
        </footer>
        <div className="journal-input-area">
          <textarea
            className="journal-textarea"
            placeholder="Écris ici tes pensées..."
            value={journalInput}
            onChange={(e) => setJournalInput(e.target.value)}
            rows="4"
          />
          <button
            className="journal-add-entry-btn"
            onClick={handleAddEntry}
            disabled={!journalInput.trim()}
          >
            Ajouter à mon journal
          </button>
        </div>
      </main>

      <button
        className="journal-nav-button next"
        onClick={goToNextDay}
        disabled={!hasNext}
        title="Page suivante"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

export default JournalContent;
