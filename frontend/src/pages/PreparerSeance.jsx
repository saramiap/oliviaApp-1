import React, { useState, useRef, useEffect } from 'react';
import { Info, Brain, Search, FileText,Share } from 'lucide-react';
import PreparationHistoryNav from '../components/PreparationHistoryNav'; // Importez la nouvelle nav
import ShareModal from '../components/ShareModal';
import '../styles/_preparerSeance.scss';

const emotions = [
  { id: 'heureux', label: 'Heureux·se', emoji: '😊' },
  { id: 'triste', label: 'Triste', emoji: '😢' },
  { id: 'enerve', label: 'Énervé·e', emoji: '😠' },
  { id: 'anxieux', label: 'Anxieux·se', emoji: '😟' },
  { id: 'confus', label: 'Confus·e', emoji: '😕' },
  { id: 'reconnaissant', label: 'Reconnaissant·e', emoji: '🙏' },
  { id: 'fatigue', label: 'Fatigué·e', emoji: '😩' },
  { id: 'fier', label: 'Fier·e', emoji: '💪' },
];

const PreparerSeance = () => {
    // --- ÉTATS PRINCIPAUX ---
  const [allPreparations, setAllPreparations] = useState([]);
  const [currentPreparationId, setCurrentPreparationId] = useState(null);
  const [currentTopic, setCurrentTopic] = useState('Sujet libre');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  
  // La source de vérité pour le texte de l'utilisateur
  const [sessionNotes, setSessionNotes] = useState(""); 
  
  // États pour chaque type de réponse d'Olivia
  const [structuredPoints, setStructuredPoints] = useState("");
  const [explorationQuestions, setExplorationQuestions] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("Nouvelle Préparation");
        // On prépare les données pour la modale


        
    const itemsToShare = [
        { id: 'trame', title: 'Ma Trame', content: structuredPoints.includes("...") ? "" : structuredPoints },
        { id: 'synthese', title: 'Ma Synthèse', content: summarizedText.includes("...") ? "" : summarizedText }
    ];

    // Détermine si le bouton Partager doit être visible
    const canShare = itemsToShare.some(item => item.content && item.content.trim() !== "");
    useEffect(() => {
    const savedPreparations = JSON.parse(localStorage.getItem('sessionPreparations') || '[]');
    setAllPreparations(savedPreparations);
    if (savedPreparations.length > 0) {
      // Charge la plus récente
      handleLoadPreparation(savedPreparations[0].id, savedPreparations);
    } else {
      // Crée la toute première préparation
      handleNewPreparation();
    }
  }, []);

  // Sauvegarde automatique quand les données changent (avec debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPreparationId) {
        saveCurrentPreparation();
      }
    }, 1500); // Sauvegarde 1.5s après la dernière modification

    return () => clearTimeout(handler);
  }, [sessionNotes, structuredPoints, explorationQuestions, summarizedText, sessionTitle, selectedEmotion, currentPreparationId]);

  const saveCurrentPreparation = () => {
    if (!currentPreparationId) return;
    
    setAllPreparations(prevAll => {
      const updatedAll = [...prevAll];
      const index = updatedAll.findIndex(p => p.id === currentPreparationId);

      const currentData = {
        id: currentPreparationId,
        title: sessionTitle || `Préparation du ${new Date().toLocaleDateString()}`,
        date: index > -1 ? updatedAll[index].date : new Date().toISOString(),
        lastModified: new Date().toISOString(),
        emotionId: selectedEmotion?.id || null,
        sessionNotes,
        structuredPoints,
        explorationQuestions,
        summarizedText,
      };

      if (index > -1) {
        updatedAll[index] = currentData;
      } else {
        updatedAll.unshift(currentData); // Ajoute au début
      }
      
      localStorage.setItem('sessionPreparations', JSON.stringify(updatedAll));
      return updatedAll;
    });
  };
  
  const handleNewPreparation = () => {
    const newId = Date.now();
    setCurrentPreparationId(newId);
    setSessionTitle("Nouvelle Préparation");
    setSelectedEmotion(null);
    setSessionNotes("");
    setStructuredPoints("");
    setExplorationQuestions("");
    setSummarizedText("");
  };

  const handleLoadPreparation = (id, preparationsList = allPreparations) => {
    const prepToLoad = preparationsList.find(p => p.id === id);
    if (prepToLoad) {
      setCurrentPreparationId(prepToLoad.id);
      setSessionTitle(prepToLoad.title);
      setSelectedEmotion(emotions.find(e => e.id === prepToLoad.emotionId) || null);
      setSessionNotes(prepToLoad.sessionNotes);
      setStructuredPoints(prepToLoad.structuredPoints);
      setExplorationQuestions(prepToLoad.explorationQuestions);
      setSummarizedText(prepToLoad.summarizedText);
    }
  };
  
  const handleDeletePreparation = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette préparation ?")) return;
    
    const newPreparations = allPreparations.filter(p => p.id !== id);
    setAllPreparations(newPreparations);
    localStorage.setItem('sessionPreparations', JSON.stringify(newPreparations));
    
    // Si on supprime la page active, on charge la plus récente ou on en crée une nouvelle
    if (currentPreparationId === id) {
      if (newPreparations.length > 0) {
        handleLoadPreparation(newPreparations[0].id, newPreparations);
      } else {
        handleNewPreparation();
      }
    }
  };

  useEffect(() => {
    let topic = "Sujet libre";
    if (selectedEmotion) {
      topic = `Explorer : ${selectedEmotion.label}`;
      // On réinitialise les résultats précédents pour un nouveau focus
      setStructuredPoints("");
      setExplorationQuestions("");
      setSummarizedText("");
    }
    setCurrentTopic(topic);
  }, [selectedEmotion]);

  const handleEmotionClick = (emotion) => {
    if (selectedEmotion?.id === emotion.id) {
      setSelectedEmotion(null);
    } else {
      setSelectedEmotion(emotion);
    }
  };

  const askOliviaForTask = async (textToProcess, taskPrompt) => {
    if (!textToProcess.trim()) {
      alert("Veuillez d'abord écrire quelque chose à analyser.");
      return null;
    }
    setIsLoadingAI(true);
    const messagesForAPI = [{
      from: 'user',
      text: `${taskPrompt}\n\nVoici le texte de l'utilisateur:\n"""\n${textToProcess}\n"""`
    }];
    
    try {
      const response = await fetch("/ask-mobile", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForAPI }),
      });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Erreur API:", error);
      return `Oups, une difficulté technique est survenue.`;
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleStructureNotes = async () => {
    const taskPrompt = "IMPORTANT: Tu agis comme un assistant psychologique. Analyse le texte suivant et extrais une trame de 3 à 5 points clés clairs et concis. Ces points doivent être formulés comme un plan de discussion que l'utilisateur pourrait présenter à son thérapeute. Présente le résultat sous forme de liste à puces.";
    setStructuredPoints("Olivia prépare votre trame...");
    const result = await askOliviaForTask(sessionNotes, taskPrompt);
    setStructuredPoints(result);
  };

  const handleExploreNotes = async () => {
    const taskPrompt = "Analyse le texte suivant. Pour aider l'utilisateur à approfondir, pose 2 ou 3 questions ouvertes et pertinentes qui l'inviteraient à réfléchir davantage sur les situations ou les émotions décrites. Ne fais pas de résumé, pose juste les questions.";
    setExplorationQuestions("Olivia cherche des pistes de réflexion...");
    const result = await askOliviaForTask(sessionNotes, taskPrompt);
    setExplorationQuestions(result);
  };
  
  const handleSummarizeNotes = async () => {
    const taskPrompt = "Synthétise le texte suivant en un court paragraphe (3-4 phrases maximum) qui capture l'idée ou l'émotion principale. Le but est de donner à l'utilisateur un résumé rapide de ses propres pensées.";
    setSummarizedText("Olivia synthétise...");
    const result = await askOliviaForTask(sessionNotes, taskPrompt);
    setSummarizedText(result);
  };

  const formatAIResponseForDisplay = (text) => {
    if (!text) return null;
    return text.split(/\n+/).filter((p) => p.trim() !== "").map((p, i) => {
      const isListItem = /^\s*(?:•|\*|-|\d+\.)\s+/.test(p);
      const htmlText = p.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} className={isListItem ? "chat-list-item" : ""} dangerouslySetInnerHTML={{ __html: htmlText }} />;
    });
  };

  return (
    <div className="prepare-session-page">
        <PreparationHistoryNav
        preparations={allPreparations}
        activeId={currentPreparationId}
        onNew={handleNewPreparation}
        onLoad={handleLoadPreparation}
        onDelete={handleDeletePreparation}
      />
      {/* <aside className="prepare-session__sidebar">
        <h2 className="sidebar__title">Explorer une émotion</h2>
        <div className="emotion-widgets-container">
          {emotions.map((emotion) => (
            <button key={emotion.id} className={`emotion-widget ${selectedEmotion?.id === emotion.id ? 'selected' : ''}`} onClick={() => handleEmotionClick(emotion)}>
              <span className="emotion-widget__emoji">{emotion.emoji}</span>
              <span className="emotion-widget__label">{emotion.label}</span>
            </button>
          ))}
        </div>
        <button className={`emotion-widget emotion-widget--clear ${!selectedEmotion ? 'selected' : ''}`} onClick={() => setSelectedEmotion(null)}>
          <span className="emotion-widget__emoji">💬</span>
          <span className="emotion-widget__label">Sujet libre</span>
        </button>
        <div className="sidebar-tip">
          <Info size={16}/> Sélectionner une émotion peut aider Olivia à mieux cibler ses questions.
        </div>
      </aside> */}

 <main className="prepare-session__main-content">
        <header className="main-content__header">
          <input
            type="text"
            className="session-title-input"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            placeholder="Titre de votre préparation"
          />
           {canShare && (
            <button className="btn btn--share" onClick={() => setIsShareModalOpen(true)}>
              <Share size={18}/> Partager
            </button>
          )}
        </header>
        
        {/* La sélection d'émotion est maintenant ici */}
        <section className="emotion-selector-section">
          <h4>Focus Émotionnel :</h4>
          <div className="emotion-chips-container">
            {emotions.map((emotion) => (
              <button key={emotion.id} className={`emotion-chip ${selectedEmotion?.id === emotion.id ? 'selected' : ''}`} onClick={() => handleEmotionClick(emotion)}>
                {emotion.emoji} {emotion.label}
              </button>
            ))}
             <button className={`emotion-chip ${!selectedEmotion ? 'selected' : ''}`} onClick={() => handleEmotionClick(null)}>
                💬 Sujet libre
             </button>
          </div>
        </section>

        <section className="session-notes-area">
          <h2>Mes Notes <span className="topic-highlight">({currentTopic})</span></h2>
          <textarea
            className="session-notes-textarea"
            placeholder="Décris ici ce qui t'est arrivé, tes ressentis, tes questions..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows="12"
          />
        </section>

        <section className="ai-actions-toolbar">
          <p>Prêt·e à faire le point ? Demandez à Olivia de vous aider :</p>
          <div className="buttons-container">
            <button onClick={handleStructureNotes} className="btn btn--ai-action" disabled={isLoadingAI || !sessionNotes.trim()} title="Créer une trame de discussion pour votre thérapeute">
              <Brain size={18} /> Créer ma trame
            </button>
            <button onClick={handleExploreNotes} className="btn btn--ai-action" disabled={isLoadingAI || !sessionNotes.trim()} title="Recevoir des questions pour approfondir votre réflexion">
              <Search size={18} /> M'aider à explorer
            </button>
            <button onClick={handleSummarizeNotes} className="btn btn--ai-action" disabled={isLoadingAI || !sessionNotes.trim()} title="Obtenir un résumé rapide de vos notes">
              <FileText size={18} /> Synthétiser
            </button>
              {/* Le nouveau bouton de partage */}
             {canShare && (
                        <button className="btn btn--share" onClick={() => setIsShareModalOpen(true)}>
                            <Share size={18}/>
                            Partager ma préparation
                        </button>
                    )}
          </div>
        </section>

        <div className="ai-results-grid">
          {structuredPoints && (
            <div className="ai-result-card">
              <div className="card-header"><Brain size={20} /><h3>Trame pour votre séance</h3></div>
              <div className="formatted-ai-response">
                {isLoadingAI && structuredPoints.includes("...") ? <div className="typing-indicator"></div> : formatAIResponseForDisplay(structuredPoints)}
              </div>
            </div>
          )}

          {explorationQuestions && (
            <div className="ai-result-card">
              <div className="card-header"><Search size={20} /><h3>Pistes de réflexion</h3></div>
              <div className="formatted-ai-response">
                {isLoadingAI && explorationQuestions.includes("...") ? <div className="typing-indicator"></div> : formatAIResponseForDisplay(explorationQuestions)}
              </div>
            </div>
          )}

          {summarizedText && (
            <div className="ai-result-card">
              <div className="card-header"><FileText size={20} /><h3>Synthèse rapide</h3></div>
              <div className="formatted-ai-response">
                {isLoadingAI && summarizedText.includes("...") ? <div className="typing-indicator"></div> : formatAIResponseForDisplay(summarizedText)}
              </div>
            </div>
          )}
        </div>
      </main>
             {/*j'appelle la modale à la fin */}
      <ShareModal 
        show={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={sessionTitle}
        itemsToShare={itemsToShare}
      />
    </div>
  );
};

export default PreparerSeance;