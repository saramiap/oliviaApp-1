import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Feather as FeatherIcon, Brain, Info } from 'lucide-react';
import { ArrowDownward as ArrowDownwardIcon, ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material'; 
import '../styles/_preparerSeance.scss';

const parseActionTag = (textWithTag) => {
  if (!textWithTag) return { displayText: '', rawText: '', actionName: null, params: {} };
  
  const tagRegex = /#([A-Z_]+)\{((?:[^}{]+|\{[^}{]*\})*)\}/; // Regex améliorée pour gérer les objets JSON potentiels dans les params (mais on parse plus simplement pour l'instant)
  const match = textWithTag.match(tagRegex);

  if (match) {
    const actionName = match[1];
    const paramsString = match[2];
    let params = {};
    try {
      // Parser des paires clé:valeur simples. Les valeurs string sont entre guillemets.
      // Regex pour extraire clé: "valeur", clé: nombre, clé: true/false
      const paramRegex = /(\w+)\s*:\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|(\d+\.?\d*|true|false))/g;
      let paramMatch;
      while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
        const key = paramMatch[1];
        let value = paramMatch[2] !== undefined ? paramMatch[2] : paramMatch[3]; // paramMatch[2] pour string, paramMatch[3] pour nombre/booléen

        if (typeof value === 'string') {
          // Pas besoin de slice les guillemets car la regex les capture à l'intérieur de paramMatch[2]
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (!isNaN(parseFloat(value))) {
          value = parseFloat(value);
        }
        params[key] = value;
      }
    } catch (e) {
      console.error("Erreur parsing des paramètres du tag:", paramsString, e);
    }
    return { 
        actionName, 
        params, 
        displayText: textWithTag.replace(tagRegex, "").trim(), // Texte sans le tag
        rawText: textWithTag // Texte original complet avec le tag
    };
  }
  return { displayText: textWithTag, rawText: textWithTag, actionName: null, params: {} };
};

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
 const [currentTopic, setCurrentTopic] = useState('Sujet libre');
  const [interactionHistory, setInteractionHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [sessionNotes, setSessionNotes] = useState(""); // Pour stocker les notes brutes de l'utilisateur
  const [structuredPoints, setStructuredPoints] = useState(""); // Pour les points structurés par Olivia
 // Nouveaux états et refs pour le scroll de la zone d'interaction
  const [showScrollButtonPrep, setShowScrollButtonPrep] = useState(false);
  const [isAtBottomPrep, setIsAtBottomPrep] = useState(true); // Supposer qu'on est en bas au début ou après un nouveau message
  
  const interactionEndRef = useRef(null);
  const notesTextAreaRef = useRef(null); // Référence pour la zone de notes principale
const chatInteractionAreaRef = useRef(null);


 useEffect(() => {
    // Message d'accueil initial d'Olivia
    const initialText = "Bonjour ! Cet espace est là pour t'aider à préparer ta prochaine séance. Sur quoi aimerais-tu te concentrer aujourd'hui ? Tu peux choisir une émotion ou commencer à écrire librement tes pensées et ressentis ci-dessous.";
    setInteractionHistory([{ 
        from: 'ai', 
        text: initialText, 
        ...parseActionTag(initialText) // Parser au cas où
    }]);
  }, []);

   useEffect(() => {
    let topic = "Sujet libre";
    let aiPrompt = "Comment puis-je t'aider à explorer cela pour ta séance ?";
    if (selectedEmotion) {
      topic = `Explorer : ${selectedEmotion.label}`;
      aiPrompt = `Concentrons-nous sur le sentiment de ${selectedEmotion.label} ${selectedEmotion.emoji}. Qu'est-ce qui te vient à l'esprit à ce sujet ?`;
      // Effacer les notes existantes si on change d'émotion pour un nouveau focus
      setSessionNotes(""); 
      setStructuredPoints("");
    }
    setCurrentTopic(topic);
    // Optionnel: ajouter le prompt d'Olivia à l'historique si l'émotion change
    // Pour l'instant, on laisse l'utilisateur écrire librement d'abord.
    // setInteractionHistory(prev => [...prev, { from: 'ai', text: aiPrompt, ...parseActionTag(aiPrompt) }]);
  }, [selectedEmotion]);

   useEffect(() => {
    // Ce useEffect est pour le scroll automatique SEULEMENT quand de nouveaux messages arrivent
    // et que l'utilisateur est déjà en bas. On évite le scroll au chargement initial.
    if (isAtBottomPrep && interactionEndRef.current && interactionHistory.length > 1) {
      // Scroll uniquement si ce ne sont pas les messages initiaux
      const lastMessage = interactionHistory[interactionHistory.length - 1];
      if (lastMessage && lastMessage.from === 'ai') {
        // Scroll uniquement après une réponse d'Olivia
        interactionEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [interactionHistory.length]); // Se déclenche uniquement quand le nombre de messages change


 const handleEmotionClick = (emotion) => {
    if (selectedEmotion?.id === emotion.id) {
      setSelectedEmotion(null); // Désélectionne si on reclique
    } else {
      setSelectedEmotion(emotion);
    }
  };

  // Appel API générique à Olivia
  const askOlivia = async (userText, contextMessages, specificPromptInstruction = "") => {
    setIsLoadingAI(true);
    const messagesForAPI = contextMessages.map((msg) => ({
      from: msg.from, // 'user' ou 'ai' (sera transformé en 'model' par le backend)
      text: msg.text, // Envoyer le texte brut avec potentiels tags
    }));

    // Ajoute l'instruction spécifique au début du dernier message utilisateur si fournie
    if (specificPromptInstruction && messagesForAPI.length > 0) {
        const lastUserMsgIndex = messagesForAPI.map(m => m.from).lastIndexOf('user');
        if (lastUserMsgIndex !== -1) {
            messagesForAPI[lastUserMsgIndex].text = `${specificPromptInstruction}\nVoici ce que j'ai écrit jusqu'à présent :\n"${messagesForAPI[lastUserMsgIndex].text}"`;
        } else { // Si pas de message utilisateur précédent, on l'ajoute
            messagesForAPI.push({from: 'user', text: `${specificPromptInstruction}\nVoici ce que j'ai écrit :\n"${userText}"` });
        }
    } else if (specificPromptInstruction) { // Si aucune interaction avant, mais un userText pour la structuration
         messagesForAPI.push({from: 'user', text: `${specificPromptInstruction}\nVoici ce que j'ai écrit :\n"${userText}"` });
    }


    try {
      const response = await fetch("/ask", { // Assure-toi que ton proxy Vite est configuré pour /ask
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForAPI }),
      });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      return data.response || "Je n'ai pas bien compris, peux-tu reformuler ?";
    } catch (error) {
      console.error("Erreur API:", error);
      return `Oups, une difficulté technique de mon côté (${error.message}). Réessayons dans un instant.`;
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Quand l'utilisateur interagit dans la zone de chat avec Olivia
  const sendChatMessageToAI = async () => {
    if (!userInput.trim()) return;
    const userMessage = { from: 'user', text: userInput, ...parseActionTag(userInput) };
    const newHistory = [...interactionHistory, userMessage];
    setInteractionHistory(newHistory);
    setUserInput('');

    const aiResponseText = await askOlivia(userInput, newHistory, "Continue d'aider l'utilisateur à explorer ses pensées pour sa séance. Pose des questions ouvertes ou propose des réflexions.");
    const parsedResponse = parseActionTag(aiResponseText);
    setInteractionHistory(prev => [...prev, { from: 'ai', text: aiResponseText, ...parsedResponse }]);
  };
  
  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoadingAI) {
      e.preventDefault();
      sendChatMessageToAI();
    }
  };

  // Demander à Olivia de structurer les notes
  const handleStructureNotes = async () => {
    if (!sessionNotes.trim()) {
      alert("Veuillez d'abord écrire quelques notes à structurer.");
      return;
    }
    setIsLoadingAI(true);
    setStructuredPoints("Olivia est en train de structurer vos idées...");

    // On envoie uniquement les notes de l'utilisateur pour cette tâche spécifique, avec un prompt clair.
    // On pourrait aussi envoyer l'historique de chat si pertinent pour le contexte.
    const messagesForStructuring = [
        ...interactionHistory, // Envoie l'historique pour le contexte
        {from: 'user', text: `Voici mes notes que j'aimerais structurer pour ma séance : "${sessionNotes}"`}
    ];

    // Instruction spécifique pour le backend
    const structuringInstruction = "IMPORTANT: Analyse les notes suivantes de l'utilisateur et aide-le à les structurer en 3 à 5 points clés clairs et concis qu'il pourrait aborder lors de sa prochaine séance avec son thérapeute. Présente ces points sous forme de liste à puces.";

    const aiResponseText = await askOlivia(sessionNotes, messagesForStructuring, structuringInstruction);
    setStructuredPoints(aiResponseText); // Afficher la réponse brute d'Olivia (qui devrait être une liste)
    setIsLoadingAI(false);
  };

  const formatAIResponseForDisplay = (text) => { // Peut être la même que formatResponse du chat
    if (!text) return null;
    return text
      .split(/\n+/)
      .filter((p) => p.trim() !== "")
      .map((p, i) => {
        const isListItem = /^\s*(?:•|\*|-|\d+\.)\s+/.test(p);
        const htmlText = p.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return <p key={i} className={isListItem ? "chat-list-item" : ""} dangerouslySetInnerHTML={{ __html: htmlText }} />;
      });
  };
   // --- Logique de Scroll pour la zone d'interaction ---
  const handleInteractionAreaScroll = useCallback(() => {
    const container = chatInteractionAreaRef.current;
    if (container) {
      const scrollThreshold = 50; 
      const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + scrollThreshold;
      setIsAtBottomPrep(atBottom);
      setShowScrollButtonPrep(container.scrollHeight > container.clientHeight && !atBottom);
    }
  }, []); // `chatInteractionAreaRef` ne change pas

 useEffect(() => {
    const container = chatInteractionAreaRef.current;
    if (container) {
      container.addEventListener('scroll', handleInteractionAreaScroll);
      handleInteractionAreaScroll(); // Appel initial
      return () => container.removeEventListener('scroll', handleInteractionAreaScroll);
    }
  }, [handleInteractionAreaScroll, interactionHistory]); // interactionHistory pour recalculer si la hauteur change

  const toggleInteractionAreaScroll = () => {
    if (!chatInteractionAreaRef.current) return;
    if (isAtBottomPrep && chatInteractionAreaRef.current.scrollTop > 0) {
      chatInteractionAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (interactionEndRef.current) {
      interactionEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsAtBottomPrep(true);
    }
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
          <div className="sidebar-tip">
            <Info size={16}/> Sélectionner une émotion peut aider Olivia à mieux cibler ses questions.
        </div>
      </aside>

      <main className="prepare-session__main-content">
        <header className="main-content__header">
          <h1>Préparer ma prochaine séance</h1>
           <p className="main-content__description">
            Utilise cet espace pour explorer librement tes pensées, sentiments et les événements récents. 
            Note tout ce qui te vient à l'esprit. Ensuite, Olivia pourra t'aider à identifier les points clés à aborder.
          </p>
          {currentTopic && <h2 className="main-content__current-topic">Focus actuel : {currentTopic}</h2>}
        </header>

        <section className="session-notes-area">
          <h2>Mes Notes pour la Séance <span className="topic-highlight">({currentTopic})</span></h2>
          <textarea
            ref={notesTextAreaRef}
            className="session-notes-textarea"
            placeholder="Décris ce qui t'est arrivé, tes ressentis, tes questions..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows="10"
          />
          <button 
            onClick={handleStructureNotes} 
            className="btn btn--structure-notes"
            disabled={isLoadingAI || !sessionNotes.trim()}
          >
            <Brain size={18} /> Olivia, aide-moi à structurer mes idées
          </button>
        </section>

        {structuredPoints && (
          <section className="structured-points-area card-style">
            <h3>Points Clés Suggérés par Olivia :</h3>
            <div className="formatted-ai-response">
                {formatAIResponseForDisplay(structuredPoints)}
            </div>
            <p className="tip">Utilise ces points comme base de discussion avec ton thérapeute.</p>
          </section>
        )}
        
        <section className="interactive-guidance-area">
            <h3>Besoin d'explorer davantage avec Olivia ?</h3>
            <p>Continue la discussion ici pour affiner tes idées ou aborder d'autres aspects.</p>
          <div className="interaction-chat-wrapper"> {/* Wrapper pour positionner le bouton de scroll */}
            <div className="interaction-area" ref={chatInteractionAreaRef} onScroll={handleInteractionAreaScroll}> {/* Similaire à ton chat */}
              {interactionHistory.map((message, index) => (
                <div key={index} className={`interaction-bubble ${message.from === 'user' ? 'bubble--user' : 'bubble--ai'}`}>
                  {message.from === 'ai' ? formatAIResponseForDisplay(message.displayText || message.text) : <p>{message.text}</p>}
                  {/* Affichage des boutons d'action si tu les réintroduis ici */}
                </div>
              ))}
              {isLoadingAI && !structuredPoints && ( /* Affiche seulement si pas déjà en train de structurer */
                <div className="interaction-bubble bubble--ai bubble--loading">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              )}
              <div ref={interactionEndRef} />
              </div>
              {showScrollButtonPrep && (
                    <button 
                        className="scroll-toggle-button-prep" // Classe spécifique
                        onClick={toggleInteractionAreaScroll} 
                        title={isAtBottomPrep && chatInteractionAreaRef.current && chatInteractionAreaRef.current.scrollTop > 0 ? "Remonter en haut" : "Aller en bas"}
                    >
                        {(isAtBottomPrep && chatInteractionAreaRef.current && chatInteractionAreaRef.current.scrollTop > 0) || (!isAtBottomPrep && chatInteractionAreaRef.current && chatInteractionAreaRef.current.scrollTop > 100)
                            ? <ArrowUpwardIconPrep fontSize="small"/> 
                            : <ArrowDownwardIconPrep fontSize="small"/>}
                    </button>
                )}
                 </div> {/* Fin de interaction-chat-wrapper */}
            
            <div className="session-input-area"> 
              <textarea
                placeholder={selectedEmotion ? `Discuter de "${selectedEmotion.label}"...` : "Pose une question à Olivia..."}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                rows="3"
                disabled={isLoadingAI}
              />
              <button onClick={sendChatMessageToAI} disabled={isLoadingAI || !userInput.trim()}>
                <FeatherIcon size={20} /> Envoyer
              </button>
            </div>
        </section>
      </main>
    </div>
  );
};

export default PreparerSeance;
