import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Feather as FeatherIcon } from 'lucide-react';
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
  const [currentTopic, setCurrentTopic] = useState('');
  const [interactionHistory, setInteractionHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const interactionEndRef = useRef(null);

  useEffect(() => {
    let initialMessage = "Bonjour ! Sur quoi aimerais-tu te concentrer pour préparer ta séance aujourd'hui ? Tu peux choisir une émotion ou écrire librement.";
    if (selectedEmotion) {
      initialMessage = `Parlons de ce sentiment : ${selectedEmotion.label} ${selectedEmotion.emoji}. Qu'est-ce qui te vient à l'esprit quand tu penses à cette émotion ?`;
    }
    setInteractionHistory([{ from: 'ai', text: initialMessage }]);
    setCurrentTopic(selectedEmotion ? selectedEmotion.label : "Sujet libre");
  }, [selectedEmotion]);

  useEffect(() => {
    interactionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactionHistory]);

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
  };

  const sendUserInputToAI = async () => {
    if (!userInput.trim()) return;

    const userMessage = { from: 'user', text: userInput };
    const updatedHistory = [...interactionHistory, userMessage];
    setInteractionHistory(updatedHistory);
    setUserInput('');
    setIsLoadingAI(true);

    const messagesForAPI = updatedHistory.map((msg) => ({
      from: msg.from,
      text: msg.text,
    }));

    try {
      const res = await axios.post("http://localhost:3000/ask", {
        messages: messagesForAPI,
      });

      const aiResponseText = res.data.response || "Je n'ai pas bien compris, peux-tu reformuler ?";
      setInteractionHistory(prev => [...prev, { from: 'ai', text: aiResponseText }]);
    } catch (error) {
      console.error("Erreur lors de la communication avec l'API :", error);
      let errorMessage = "Oups, une erreur technique est survenue.";
      if (error.response?.data?.error) {
        errorMessage = `Erreur du serveur : ${error.response.data.error}`;
      } else if (error.request) {
        errorMessage = "Impossible de joindre le serveur. Vérifie ta connexion.";
      }
      setInteractionHistory(prev => [...prev, { from: 'ai', text: errorMessage }]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoadingAI) {
      e.preventDefault();
      sendUserInputToAI();
    }
  };

  const formatResponse = (text) => {
    if (!text) return null;
    return text
      .split(/\n+/)
      .filter((paragraph) => paragraph.trim() !== "")
      .map((paragraph, i) => {
        const isListItem = /^\s*(?:•|\*|-|\d+\.)\s+/.test(paragraph);
        const htmlText = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return (
          <p key={i} className={isListItem ? "chat-list-item" : ""} dangerouslySetInnerHTML={{ __html: htmlText }} />
        );
      });
  };

  return (
    <div className="prepare-session-page">
      <aside className="prepare-session__sidebar">
        <h2 className="sidebar__title">Explorer une émotion</h2>
        <div className="emotion-widgets-container">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              className={`emotion-widget ${selectedEmotion?.id === emotion.id ? 'selected' : ''}`}
              onClick={() => handleEmotionClick(emotion)}
            >
              <span className="emotion-widget__emoji">{emotion.emoji}</span>
              <span className="emotion-widget__label">{emotion.label}</span>
            </button>
          ))}
          <button
            className={`emotion-widget emotion-widget--clear ${!selectedEmotion ? 'selected' : ''}`}
            onClick={() => setSelectedEmotion(null)}
          >
            <span className="emotion-widget__emoji">💬</span>
            <span className="emotion-widget__label">Sujet libre</span>
          </button>
        </div>
      </aside>

      <main className="prepare-session__main-content">
        <header className="main-content__header">
          <h1>Préparer ma séance</h1>
          <p className="main-content__description">
            Utilise cet espace pour noter tes idées, explorer tes émotions et structurer tes pensées avant ta prochaine consultation. Olivia est là pour t'accompagner dans cette réflexion.
          </p>
          {currentTopic && <h2 className="main-content__current-topic">Focus actuel : {currentTopic}</h2>}
        </header>

        <div className="interaction-area">
          {interactionHistory.map((message, index) => (
            <div
              key={index}
              className={`interaction-bubble ${message.from === 'user' ? 'bubble--user' : 'bubble--ai'}`}
            >
              {message.from === 'ai' ? formatResponse(message.text) : <p>{message.text}</p>}
            </div>
          ))}
          {isLoadingAI && (
            <div className="interaction-bubble bubble--ai bubble--loading">
              <p>Olivia réfléchit...</p>
            </div>
          )}
          <div ref={interactionEndRef} />
        </div>

        <div className="session-input-area">
          <textarea
            placeholder={selectedEmotion ? `Écris à propos de ${selectedEmotion.label}...` : "Tes pensées, tes questions..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="3"
            disabled={isLoadingAI}
          />
          <button onClick={sendUserInputToAI} disabled={isLoadingAI || !userInput.trim()}>
            <FeatherIcon size={20} /> Envoyer
          </button>
        </div>
      </main>
    </div>
  );
};

export default PreparerSeance;
