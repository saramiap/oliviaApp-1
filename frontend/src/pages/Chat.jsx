import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios"; // Ou fetch si tu préfères pour la cohérence avec le backend
import OliviaAvatar from "../components/OliviaAvatar";
import useSpeech from "../hooks/useSpeech";
import { ArrowDownward as ArrowDownwardIcon, ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import Journal from "./Journal";
import { Zap, Waves, BookOpen, Info, ExternalLink, MessageSquare, Edit3, Settings, Users, Headphones, CloudRain, Sun, Wind, Music2 } from 'lucide-react'; // Ajout d'icônes

import "../styles/_chat.scss"

const EMERGENCY_KEYWORDS = [
  "suicide",
  "je veux mourir",
  "tuer",
  "plus envie de vivre",
  "violence",
  "je me fais mal",
  "je suis en danger",
  "j’ai besoin d’aide",
  "je vais mal",
  "pensées suicidaires",
  "on m’a agressé",
  "je me sens en insécurité",
];

// Fonction utilitaire pour parser les tags d'action
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



const Chat = () => {
  // Renommé pour plus de clarté, mais tu peux garder Chat
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false); // Pour la flèche up/down
  const [history, setHistory] = useState([]); // Historique des conversations du chat
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true); // Pour gérer l'affichage de la flèche et le scroll
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [silentMode, setSilentMode] = useState(false); // Pour le mode "vider son sac"
  // const [journal, setJournal] = useState([]); // Cet état 'journal' était spécifique au chat, à clarifier si besoin

  const [mode, setMode] = useState("chat"); // "chat" ou "journal"
  const [userProfileAvatar, setUserProfileAvatar] = useState("");

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); // Référence au conteneur des messages pour le scroll
  const { speak, isSpeaking, cancelSpeech } = useSpeech(false); // Supposons que cancelSpeech existe
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedAvatar) {
      setUserProfileAvatar(storedAvatar);
    }

    // Initialisation du chat (messages)
    const storedChatMessages = localStorage.getItem("chatMessages");
    if (storedChatMessages) {
      setMessages(JSON.parse(storedChatMessages));
    } else {
      setMessages([
        {
          from: "model",
          text: "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd’hui.",
        },
      ]);
    }
    // Charger l'historique du chat si stocké
    const storedChatHistory = localStorage.getItem("chatHistory");
    if (storedChatHistory) {
      setHistory(JSON.parse(storedChatHistory));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0 && mode === "chat") {
      // Sauvegarder uniquement si en mode chat et messages existent
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages, mode]);

  useEffect(() => {
    if (history.length > 0 && mode === "chat") {
      localStorage.setItem("chatHistory", JSON.stringify(history));
    }
  }, [history, mode]);

  useEffect(() => {
    // 3. Scroll initial vers le bas (modifié)
    // Scrolle seulement si on est considéré "en bas" ou si c'est une nouvelle réponse de l'IA.
    // Et pas au chargement initial sauf si l'utilisateur était déjà en bas.
    if (
      mode === "chat" &&
      messagesEndRef.current &&
      !isInitialLoad &&
      isAtBottom
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (messages.length > 0 && mode === "chat") {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages, mode, isInitialLoad, isAtBottom]);

  // 2. Problème de son : Arrêter la parole si voiceEnabled est désactivé ou si on quitte le mode chat
  useEffect(() => {
    if (!voiceEnabled && isSpeaking && cancelSpeech) {
      cancelSpeech();
    }
  }, [voiceEnabled, isSpeaking, cancelSpeech]);

  useEffect(() => {
    // Arrêter la parole si on change de mode (chat -> journal)
    if (mode !== "chat" && isSpeaking && cancelSpeech) {
      cancelSpeech();
    }
  }, [mode, isSpeaking, cancelSpeech]);
  const handleVoiceToggleChange = (event) => {
    const isChecked = event.target.checked;
    setVoiceEnabled(isChecked);
    if (!isChecked && isSpeaking && cancelSpeech) {
      cancelSpeech(); // Arrête la parole immédiatement si on décoche
    }
  };

  const containsEmergencyKeyword = (text) =>
    EMERGENCY_KEYWORDS.some((word) => text.toLowerCase().includes(word));

 const handleAIResponse = (aiReplyText, contextMessages) => {
    const parsed = parseActionTag(aiReplyText);
    const aiMessage = { 
        from: "model", 
        text: aiReplyText, // Texte brut avec tag pour sauvegarde et re-parsing
        displayText: parsed.displayText, 
        actionName: parsed.actionName, 
        actionParams: parsed.params 
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsAtBottom(true);
    if (voiceEnabled && !silentMode && parsed.displayText) speak(parsed.displayText);

    if (parsed.actionName === "REDIRECT" && parsed.params?.path) {
        setTimeout(() => navigate(parsed.params.path), 700);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessageText = input;
    const userMessageForUI = { from: "user", text: userMessageText, displayText: userMessageText };
    
    setMessages(prev => [...prev, userMessageForUI]);
    setIsAtBottom(true);
    setInput("");

    if (silentMode) { setLoading(false); return; }

    if (containsEmergencyKeyword(userMessageText.toLowerCase())) {
      const emergencyMsgText = `Je comprends ton inquiétude. Il est important de chercher de l'aide rapidement. Je te redirige vers nos ressources d'urgence. #REDIRECT{path:"/urgence"}`;
      handleAIResponse(emergencyMsgText, messages.concat(userMessageForUI));
      setShowEmergencyModal(true);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const messagesForAPI = messages.concat(userMessageForUI).map(m => ({ from: m.from, text: m.text }));

    try {
      const res = await axios.post("http://localhost:3000/ask", { messages: messagesForAPI });
      handleAIResponse(res.data.response || "Pardon, je n'ai pas saisi.", messages.concat(userMessageForUI));
    } catch (error) {
      console.error("Erreur API Chat:", error);
      handleAIResponse(
        `Navrée, une erreur technique est survenue. (${error.message})`,
        messages.concat(userMessageForUI)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Envoyer avec Entrée, nouvelle ligne avec Shift+Entrée
      e.preventDefault();
      sendMessage();
    }
  };
  // 4. Flèche de scroll
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const atBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50; // +50px de marge
      const hasScroll = container.scrollHeight > container.clientHeight;

      setIsAtBottom(atBottom);
      setShowScrollButton(hasScroll); // Afficher le bouton seulement s'il y a du scroll
    }
  };
  const toggleScrollToPosition = () => {
    if (!chatContainerRef.current) return;
    if (isAtBottom) {
      // Si on est en bas, on veut scroller en haut
      chatContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Sinon, on veut scroller en bas
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && mode === "chat") {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Vérifier l'état initial du scroll
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [mode, messages]); // Ré-évaluer si le mode ou les messages changent (pour la hauteur)

  const clearChatHistoryAndMessages = () => {
    setMessages([
      {
        from: "model",
        text: "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd’hui.",
      },
    ]);
    setHistory([]); // Vider l'historique des conversations sauvegardées
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatHistory");
    setShowConfirmClear(false);
  };

  const formatResponse = (text) => {
    if (!text) return null;

    return text
      .split(/\n+/) // Sépare le texte en blocs à chaque fois qu'il y a un ou plusieurs sauts de ligne
      .filter((paragraphText) => paragraphText.trim() !== "") // Enlève les blocs qui seraient vides
      .map((paragraphText, i) => {
        let content = paragraphText.trim(); // Le texte du paragraphe courant

        // 1. Gérer le gras : remplacer **texte** par <strong>texte</strong>
        // Cette regex capture le texte entre les ** et le remplace par <strong>contenu</strong>
        content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // 2. Détecter si la ligne est un item de liste pour l'indentation
        //    On teste sur 'paragraphText' original (avant remplacement du gras) pour la détection du motif de liste.
        //    Le motif de liste peut être •, *, -, ou un numéro suivi d'un point (ex: 1.)
        const listItemRegex = /^\s*(?:•|\*|-|\d+\.)\s+/;
        const isListItem = listItemRegex.test(paragraphText.trim());

        const pClassName = isListItem ? "chat-list-item" : "";

        // Utiliser dangerouslySetInnerHTML car 'content' contient maintenant des balises <strong>
        return (
          <p
            key={i}
            className={pClassName}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      });
  };
    const handleActionClick = (actionName, params) => {
    console.log("Action cliquée:", actionName, params);
    switch (actionName) {
      case "EXERCICE_RESPIRATION":
        navigate(`/detente/programme`, { state: { type: params?.type, duration: params?.duree_sec, cycles: params?.cycles } });
        break;
      case "VOYAGE_SONORE":
        navigate(`/detente/voyage-sonore`, { state: { autoSelectThemeId: params?.themeId } });
        break;
      case "SUGGESTION_JOURNAL":
        setMode('journal'); // Switch vers le mode journal
        // Tu devras passer le prompt au composant Journal, peut-être via un contexte ou un état dans App.js
        // Pour l'instant, on loggue juste le prompt :
        console.log("Prompt pour le journal:", params?.prompt);
        alert(`Olivia suggère d'écrire sur : ${params?.prompt}`);
        break;
      case "INFO_STRESS":
        navigate(`/detente/comprendre-stress${params?.sujet ? '#' + params.sujet : ''}`);
        break;
      // REDIRECT est géré dans handleAIResponse
      default:
        console.warn("Action non reconnue:", actionName);
    }
  };

  return (
    <div className="chat-journal-layout">
      <nav className="page-navigation">
        {mode === "chat" ? (
          <>
            <OliviaAvatar
              isSpeaking={isSpeaking && voiceEnabled && !silentMode}
            />
            <div className="chat-controls"> {/* Wrapper pour les toggles */}
              <div className="chat__voice-toggle">
                <label title={voiceEnabled ? "Désactiver la voix" : "Activer la voix"}>
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={handleVoiceToggleChange}
                  />
                  Voix {voiceEnabled ? "🔊" : "🔇"}
                </label>
              </div>
              {/* Correction ici : un seul chat__silent-toggle */}
              <div className="chat__silent-toggle">
                <label title={silentMode ? "Reprendre le dialogue" : "Mode écoute seule"}>
                  <input
                    type="checkbox"
                    checked={silentMode}
                    onChange={() => setSilentMode(!silentMode)}
                  />
                  Écoute {silentMode ? "✍️" : "💬"}
                </label>
                {/* Le small pour silent-mode-info peut être stylé via CSS pour être caché ou affiché si besoin */}
                 {silentMode && (
                  <small className="silent-mode-info">
                    Olivia n'interviendra pas.
                  </small>
                )} 
              </div>
            </div>
            <div className="history-chat-wrapper">
              <div className="history-chat">
                {/* <h3>Historique Chat</h3>  Commenté car caché sur mobile par défaut */}
                {/* Affichage de l'historique (simplifié pour l'exemple) */}
                 {history.length > 0 ? (
                  history.map((conv, idx) => (
                    <div key={idx} className="history-item">
                      Conversation du {new Date(conv.date).toLocaleDateString()}
                    </div>
                  ))
                ) : (
                  <p className="no-history-text">Aucun historique.</p>
                )} 
                {messages.length > 1 && ( // Afficher si plus que le message initial d'Olivia
                  <button
                    className="clear-history-btn"
                    onClick={() => setShowConfirmClear(true)}
                    title="Effacer la conversation actuelle"
                  >
                    🗑️ Effacer
                  </button>
                )}
              </div>
            </div>
            {showConfirmClear && (
              <div className="confirmation-modal">
                <p>Effacer la conversation actuelle ?</p>
                <div className="confirmation-actions">
                  <button onClick={clearChatHistoryAndMessages}>Oui</button>
                  <button onClick={() => setShowConfirmClear(false)}>
                    Non
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="journal-navigation-content">
            <img
              src={userProfileAvatar || "/images/default-avatar.png"} // Ajout d'un fallback
              alt="Mon profil"
              className="profile-avatar-display"
            />
            <h2>📖 Mon Carnet</h2>
          </div>
        )}
      </nav>

      <main className="main-content-area">
        <div className="mode-switcher">
          <button
            className={mode === "chat" ? "active" : ""}
            onClick={() => setMode("chat")}
          >
            💬 Dialogue avec Olivia
          </button>
          <button
            className={mode === "journal" ? "active" : ""}
            onClick={() => setMode("journal")}
          >
            📓 Mon Carnet Personnel
          </button>
        </div>

        {mode === "chat" ? (
          <div className="chat-interface-wrapper">
            <div className="chat-messages-container" ref={chatContainerRef} onScroll={handleScroll}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble-wrapper ${msg.from === "user" ? "user-message-wrapper" : "ai-message-wrapper"}`}>
                  <div className={`message-bubble ${msg.from === "user" ? "user-message" : "ai-message"}`}>
                    {msg.from === "model" ? formatResponse(msg.displayText) : <p>{msg.displayText}</p>}
                  </div>
                  {msg.from === "model" && msg.actionName && msg.actionParams && (
                    <button 
                      className="btn btn--action-tag" 
                      onClick={() => handleActionClick(msg.actionName, msg.actionParams)}
                      title={`Action: ${msg.actionName}`}
                    >
                      {msg.actionName === "EXERCICE_RESPIRATION" && <><Zap size={16}/> Pratiquer la respiration</>}
                      {msg.actionName === "VOYAGE_SONORE" && <><Waves size={16}/> Démarrer le voyage sonore</>}
                      {msg.actionName === "SUGGESTION_JOURNAL" && <><BookOpen size={16}/> Écrire dans mon journal</>}
                      {msg.actionName === "INFO_STRESS" && <><Info size={16}/> En savoir plus</>}
                      {msg.actionName === "REDIRECT" && <><ExternalLink size={16}/> Voir les ressources</>}
                      {!["EXERCICE_RESPIRATION", "VOYAGE_SONORE", "SUGGESTION_JOURNAL", "INFO_STRESS", "REDIRECT"].includes(msg.actionName) && 
                        `Suggestion: ${msg.actionName.toLowerCase().replace(/_/g, ' ')}`}
                    </button>
                  )}
                </div>
              ))}
             {loading && (
                <div className="message-bubble ai-message">
                  <p>Olivia est en train de réfléchir...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {showScrollButton && (
              <button className="scroll-toggle-button" onClick={toggleScrollToPosition} title={isAtBottom ? "Remonter en haut" : "Aller en bas"}>
                {chatContainerRef.current && chatContainerRef.current.scrollTop > 100 && !isAtBottom ? <ArrowDownwardIcon fontSize="small"/> : <ArrowUpwardIcon fontSize="small"/>}
              </button>
            )}
            <div className="chat-input-area">
              <textarea
                placeholder="Écris ton message ici..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows="3" // Ajuster le nombre de lignes initiales
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}>
                📨
              </button>
            </div>
          </div>
        ) : (
          <Journal /> // Le composant Journal gère son propre layout interne
        )}
      </main>

      {showEmergencyModal && (
        <div className="modal-backdrop">
          <div className="emergency-modal-content">
            <h2>Besoin d’aide immédiatement ?</h2>
            <p>
              Tu n’es pas seul·e. Appelle le <strong>3114</strong> (numéro
              national de prévention du suicide, gratuit, 24/7).
            </p>
            <button
              onClick={() => navigate("/urgence")}
              className="btn-urgence-action"
            >
              Voir les ressources
            </button>
            <button onClick={() => setShowEmergencyModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
