// src/pages/Chat.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import OliviaAvatar from "../components/OliviaAvatar";
import useSpeech from "../hooks/useSpeech";
import { ArrowDownward as ArrowDownwardIcon, ArrowUpward as ArrowUpwardIcon, KeyboardArrowUp as ArrowUpIcon } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import Journal from "./Journal"; // Assure-toi que ce chemin est correct et que Journal est exporté par défaut
import { Zap, Waves, BookOpen, Info, ExternalLink, Menu, Plus, MessageCircle, Trash2 } from 'lucide-react'; // Icônes pour les boutons d'action

import "../styles/_chat.scss"; // Ton fichier SCSS principal

const EMERGENCY_KEYWORDS = [
  "suicide", "je veux mourir", "tuer", "plus envie de vivre", "violence",
  "je me fais mal", "je suis en danger", "j’ai besoin d’aide", "je vais mal",
  "pensées suicidaires", "on m’a agressé", "je me sens en insécurité",
];

// Fonction utilitaire pour parser les tags d'action des messages de l'IA
const parseActionTag = (textWithTag) => {
  // Gère le cas où textWithTag est null, undefined ou pas une chaîne
  if (!textWithTag || typeof textWithTag !== 'string') {
    const safeText = String(textWithTag || '');
    return { displayText: safeText, rawText: safeText, actionName: null, params: {} };
  }
  
  const tagRegex = /#([A-Z_]+)\{((?:[^}{]+|\{[^}{]*\})*)\}/;
  const match = textWithTag.match(tagRegex);

  if (match) {
    const actionName = match[1];
    const paramsString = match[2];
    let params = {};
    try {
      const paramRegex = /(\w+)\s*:\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|(\d+\.?\d*|true|false))/g;
      let paramMatch;
      while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
        const key = paramMatch[1];
        let value = paramMatch[2] !== undefined ? paramMatch[2].replace(/\\"/g, '"') : paramMatch[3]; 

        if (value === 'true') { value = true; }
        else if (value === 'false') { value = false; }
        // Vérifie si c'est un nombre qui était entre guillemets ou pas
        else if (typeof value === 'string' && !isNaN(parseFloat(value)) && parseFloat(value).toString() === value.replace(/^"|"$/g, '')) {
             value = parseFloat(value.replace(/^"|"$/g, ''));
        }
        params[key] = value;
      }
    } catch (e) {
      console.error("Erreur parsing des paramètres du tag:", paramsString, e);
    }
    return { 
        actionName, 
        params, 
        displayText: textWithTag.replace(tagRegex, "").trim(),
        rawText: textWithTag 
    };
  }
  return { displayText: textWithTag, rawText: textWithTag, actionName: null, params: {} };
};


const Chat = () => {
  const navigate = useNavigate();

  // États du composant
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // Pour l'indicateur "Olivia réfléchit"
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [mode, setMode] = useState("chat");
  const [userProfileAvatar, setUserProfileAvatar] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isInActiveConversation, setIsInActiveConversation] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [history, setHistory] = useState([]); // L'historique séparé peut être réintroduit si besoin

  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Hook pour la synthèse vocale
  const { speak, isSpeaking, cancelSpeech } = useSpeech(false);

  // --- FONCTIONS UTILITAIRES POUR L'HISTORIQUE ---

  const generateConversationTitle = (messages) => {
    if (messages.length < 2) return "Nouvelle conversation";
    const userMessages = messages.filter(msg => msg.from === "user");
    if (userMessages.length === 0) return "Nouvelle conversation";
    
    const firstUserMessage = userMessages[0].text;
    return firstUserMessage.length > 50
      ? firstUserMessage.substring(0, 50) + "..."
      : firstUserMessage;
  };

  const loadConversationHistory = () => {
    try {
      const stored = localStorage.getItem("conversationHistory");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Erreur chargement historique:", e);
      return [];
    }
  };

  const saveConversationHistory = (history) => {
    try {
      localStorage.setItem("conversationHistory", JSON.stringify(history));
    } catch (e) {
      console.error("Erreur sauvegarde historique:", e);
    }
  };

  const createNewConversation = () => {
    // Sauvegarder la conversation actuelle si elle existe
    if (currentConversationId && messages.length > 1) {
      saveCurrentConversation();
    }

    // Créer nouvelle conversation
    const newConversationId = Date.now().toString();
    const initialText = "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd'hui.";
    const newMessages = [{ from: "model", text: initialText, ...parseActionTag(initialText) }];
    
    setCurrentConversationId(newConversationId);
    setMessages(newMessages);
    setIsInActiveConversation(false);
    localStorage.setItem("chatMessages", JSON.stringify(newMessages.map(({ from, text }) => ({ from, text }))));
  };

  const saveCurrentConversation = () => {
    if (!currentConversationId || messages.length <= 1) return;

    const history = loadConversationHistory();
    const title = generateConversationTitle(messages);
    const conversationData = {
      id: currentConversationId,
      title,
      messages: messages.map(({ from, text }) => ({ from, text })),
      lastUpdated: Date.now()
    };

    const existingIndex = history.findIndex(conv => conv.id === currentConversationId);
    if (existingIndex >= 0) {
      history[existingIndex] = conversationData;
    } else {
      history.unshift(conversationData);
    }

    // Garder seulement les 50 dernières conversations
    const limitedHistory = history.slice(0, 50);
    setConversationHistory(limitedHistory);
    saveConversationHistory(limitedHistory);
  };

  const loadConversation = (conversationId) => {
    const history = loadConversationHistory();
    const conversation = history.find(conv => conv.id === conversationId);
    
    if (conversation) {
      // Sauvegarder la conversation actuelle avant de changer
      if (currentConversationId && messages.length > 1) {
        saveCurrentConversation();
      }

      const loadedMessages = conversation.messages.map(msg => ({
        ...msg, ...parseActionTag(msg.text)
      }));
      
      setCurrentConversationId(conversationId);
      setMessages(loadedMessages);
      setIsInActiveConversation(true);
      localStorage.setItem("chatMessages", JSON.stringify(conversation.messages));
      
      // Fermer le sidebar sur mobile
      if (window.innerWidth < 768) {
        setShowHistorySidebar(false);
      }
    }
  };

  const deleteConversation = (conversationId) => {
    const conversation = conversationHistory.find(conv => conv.id === conversationId);
    setConversationToDelete(conversation);
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = () => {
    if (conversationToDelete) {
      const history = loadConversationHistory();
      const updatedHistory = history.filter(conv => conv.id !== conversationToDelete.id);
      setConversationHistory(updatedHistory);
      saveConversationHistory(updatedHistory);

      // Si c'est la conversation actuelle, créer une nouvelle
      if (currentConversationId === conversationToDelete.id) {
        createNewConversation();
      }
    }
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  const cancelDeleteConversation = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  // --- EFFETS ---

  // Chargement initial des données (avatar, messages depuis localStorage, historique)
  useEffect(() => {
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedAvatar) setUserProfileAvatar(storedAvatar);

    // Charger l'historique des conversations
    const history = loadConversationHistory();
    setConversationHistory(history);

    const storedChatMessages = localStorage.getItem("chatMessages");
    let initialMsgs = [];
    let conversationId = null;

    if (storedChatMessages) {
      try {
        const parsedMessages = JSON.parse(storedChatMessages);
        initialMsgs = parsedMessages.map(msg => {
          if (!msg || typeof msg.text !== 'string') return null;
          return { ...msg, ...parseActionTag(msg.text) };
        }).filter(Boolean);

        // Trouver ou créer un ID pour cette conversation
        if (initialMsgs.length > 1) {
          const title = generateConversationTitle(initialMsgs);
          const existingConversation = history.find(conv => conv.title === title);
          conversationId = existingConversation ? existingConversation.id : Date.now().toString();
          setIsInActiveConversation(true);
        }
      } catch (e) {
        console.error("CHAT: Erreur parsing messages localStorage:", e);
        localStorage.removeItem("chatMessages");
      }
    }
    
    if (initialMsgs.length === 0) {
      const initialText = "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd'hui.";
      initialMsgs = [{
        from: "model", text: initialText, ...parseActionTag(initialText)
      }];
      conversationId = Date.now().toString();
    }

    setCurrentConversationId(conversationId);
    setMessages(initialMsgs);
    setIsInitialLoadComplete(true);
  }, []);

  // Sauvegarde des messages dans localStorage ET mise à jour de l'historique
  useEffect(() => {
    if (isInitialLoadComplete && messages.length > 0 && mode === "chat") {
      const messagesToStore = messages.map(({ from, text }) => ({ from, text }));
      localStorage.setItem("chatMessages", JSON.stringify(messagesToStore));
      
      // Sauvegarder dans l'historique après chaque message (avec debounce)
      if (messages.length > 1) {
        const timeoutId = setTimeout(() => {
          saveCurrentConversation();
        }, 1000); // Attendre 1 seconde avant de sauvegarder pour éviter trop de saves
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messages, mode, isInitialLoadComplete, currentConversationId]);

  // Positionnement initial au dernier message SEULEMENT dans le container de chat
  useEffect(() => {
    if (mode === "chat" && chatContainerRef.current && isInitialLoadComplete && messages.length > 1) {
      // Position directe au bas du CONTAINER SEULEMENT, pas de la page
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
      setIsAtBottom(true);
    }
  }, [isInitialLoadComplete, mode]); // Une seule fois au chargement

  // Gestion de l'arrêt de la synthèse vocale
  useEffect(() => { if (!voiceEnabled && isSpeaking && cancelSpeech) cancelSpeech(); }, [voiceEnabled, isSpeaking, cancelSpeech]);
  useEffect(() => { if (mode !== "chat" && isSpeaking && cancelSpeech) cancelSpeech(); }, [mode, isSpeaking, cancelSpeech]);

  // Détection du scroll manuel pour afficher/cacher les boutons de scroll
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (container) {
      const scrollThreshold = 50;
      const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + scrollThreshold;
      const atTop = container.scrollTop <= scrollThreshold;
      
      setIsAtBottom(atBottom);
      setShowScrollButton(container.scrollHeight > container.clientHeight && !atBottom);
      setShowScrollToTopButton(container.scrollHeight > container.clientHeight && !atTop && container.scrollTop > 100);
    }
  }, []); // Le tableau de dépendances est vide car chatContainerRef.current ne cause pas de re-création de la fonction

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && mode === "chat") {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); 
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [mode, handleScroll, messages]); // `messages` car sa longueur affecte scrollHeight

  // --- FONCTIONS HANDLER ---

  const handleVoiceToggleChange = (event) => {
    const newVoiceEnabledState = event.target.checked;
    setVoiceEnabled(newVoiceEnabledState);
    if (!newVoiceEnabledState && isSpeaking && cancelSpeech) {
      cancelSpeech();
    }
  };

  const containsEmergencyKeyword = (text) => EMERGENCY_KEYWORDS.some(word => text.toLowerCase().includes(word));

  const handleAIResponse = (aiReplyText, currentMessagesContextForUI) => {
    const parsed = parseActionTag(aiReplyText);
    const aiMessage = { 
        from: "model", text: aiReplyText, 
        displayText: parsed.displayText, 
        actionName: parsed.actionName, actionParams: parsed.params 
    };
    setMessages(prevMsgs => [...prevMsgs, aiMessage]);
    setIsAtBottom(true); 
    if (voiceEnabled && !silentMode && parsed.displayText) speak(parsed.displayText);
    if (parsed.actionName === "REDIRECT" && parsed.params?.path) {
        setTimeout(() => navigate(parsed.params.path), 700);
    }
  };

const sendMessage = async () => {
  if (!input.trim()) return;
  
  // Activer la conversation dès le premier message utilisateur
  if (!isInActiveConversation) {
    setIsInActiveConversation(true);
  }
  
  const userMessageText = input;
  const userMessageForUI = {
    from: "user",
    text: userMessageText,
    displayText: userMessageText,
    actionName: null,
    actionParams: {}
  };
  
  // 1. Préparer les messages pour l'API AVANT de mettre à jour l'état
  //    On utilise l'état `messages` actuel et on y ajoute le nouveau message utilisateur.
  const messagesForAPI = [...messages, userMessageForUI].map(m => ({
    from: m.from,
    text: m.text // Utilise le texte brut original (avec tags pour les messages IA)
  }));

  // 2. Mettre à jour l'UI avec le message de l'utilisateur
  setMessages(prevMsgs => [...prevMsgs, userMessageForUI]);
  setIsAtBottom(true);
  setInput("");

  if (silentMode) { 
    setLoading(false); // Assure-toi que loading est remis à false
    return; 
  }

  // La logique pour les mots-clés d'urgence doit aussi utiliser une version à jour des messages
  // ou être gérée après la mise à jour de l'état, mais c'est plus complexe.
  // Pour l'instant, on va supposer qu'on continue avec l'appel API normal.
  if (containsEmergencyKeyword(userMessageText.toLowerCase())) {
    const emergencyMsgText = `Je comprends ton inquiétude. Il est important de chercher de l'aide rapidement. Je te redirige vers nos ressources d'urgence. #REDIRECT{path:"/urgence"}`;
    // On passe messagesForAPI (qui inclut déjà le msg utilisateur) comme contexte
    handleAIResponse(emergencyMsgText, messagesForAPI.map(m => ({...m, ...parseActionTag(m.text)})) ); // Reparse pour handleAIResponse
    setShowEmergencyModal(true);
    setLoading(false); // Pas de chargement IA pour ce cas
    return;
  }
  
  console.log("CHAT: sendMessage - setLoading(true)");
  setLoading(true);

  try {
    const response = await fetch("http://localhost:3000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: messagesForAPI })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Pour handleAIResponse, on a besoin du contexte UI (avec displayText, etc.)
    // On peut le reconstruire à partir de messagesForAPI ou utiliser l'état messages qui sera mis à jour.
    // Option plus sûre : reconstruire à partir de messagesForAPI pour le contexte exact envoyé
    const contextForUI = messagesForAPI.map(m => ({...m, ...parseActionTag(m.text)}));
    handleAIResponse(data.response || "Pardon, je n'ai pas saisi.", contextForUI);
  } catch (error) {
    console.error("Erreur API Chat:", error);
    const contextForUI = messagesForAPI.map(m => ({...m, ...parseActionTag(m.text)}));
    handleAIResponse(
      `Navrée, une erreur technique est survenue. (${error.message})`,
      contextForUI
    );
  } finally {
    console.log("CHAT: sendMessage - setLoading(false)");
    setLoading(false);
  }
};
  
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); sendMessage(); }};
  
  const toggleScrollToPosition = () => {
    if (!chatContainerRef.current) return;
    if (isAtBottom && chatContainerRef.current.scrollTop > 0) {
      chatContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }
  };

  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  const clearChatHistoryAndMessages = () => {
    // Créer une nouvelle conversation au lieu d'effacer
    createNewConversation();
    setShowConfirmClear(false);
    setIsAtBottom(true);
  };

  const formatResponse = (textToFormat) => {
    if (!textToFormat) return []; 
    return textToFormat
      .split(/\n+/)
      .filter((pText) => pText.trim() !== "")
      .map((pText, i) => {
        let content = pText.trim();
        content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        const listItemRegex = /^\s*(?:•|\*|-|\d+\.)\s+/;
        const isListItem = listItemRegex.test(pText); // Test sur pText original pour les espaces
        const pClassName = isListItem ? "chat-list-item" : "";
        return ( <p key={i} className={pClassName} dangerouslySetInnerHTML={{ __html: content }} /> );
      });
  };

  const handleActionClick = (actionName, params) => {
    console.log("Action cliquée:", actionName, params);
    // Assure-toi que les routes et la gestion d'état (state) sont correctes pour chaque action
    switch (actionName) {
      case "EXERCICE_RESPIRATION":
        navigate(`/detente/programme`, { state: { type: params?.type, duration: params?.duree_sec, cycles: params?.cycles, autoStart: true } });
        break;
      case "VOYAGE_SONORE":
        navigate(`/detente/voyage-sonore`, { state: { autoSelectThemeId: params?.themeId, autoPlay: true } });
        break;
      case "SUGGESTION_JOURNAL":
        setMode('journal');
        if (params?.prompt) localStorage.setItem('journalPromptSuggestion', params.prompt); // Pour que Journal.js puisse le lire
        alert(`Olivia suggère d'écrire sur : ${params?.prompt}`);
        break;
      case "INFO_STRESS":
        navigate(`/detente/comprendre-stress${params?.sujet ? '#' + params.sujet : ''}`);
        break;
      default:
        console.warn("Action non reconnue:", actionName);
    }
  };

  // ----- JSX de Rendu -----
  return (
    <div className="chat-journal-layout">
      {/* Sidebar d'historique MOBILE SEULEMENT */}
      {mode === "chat" && (
        <>
          <aside className={`conversation-history-sidebar mobile-only ${showHistorySidebar ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-title">
                <h3>Historique des conversations</h3>
                <button
                  className="close-sidebar-btn"
                  onClick={() => setShowHistorySidebar(false)}
                  title="Fermer l'historique"
                >
                  ✕
                </button>
              </div>
              <button className="new-conversation-btn" onClick={createNewConversation} title="Nouvelle conversation">
                <Plus size={20} />
                Nouvelle conversation
              </button>
            </div>
            
            <div className="conversation-list">
              {conversationHistory.length === 0 ? (
                <div className="no-conversations">
                  <MessageCircle size={32} />
                  <p>Aucune conversation</p>
                </div>
              ) : (
                conversationHistory.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="conversation-content">
                      <MessageCircle size={16} />
                      <span className="conversation-title">{conversation.title}</span>
                    </div>
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      title="Supprimer cette conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
          
          {/* Overlay pour mobile */}
          {showHistorySidebar && <div className="mobile-overlay" onClick={() => setShowHistorySidebar(false)} />}
        </>
      )}

      <nav className="page-navigation">
        {mode === "chat" ? (
          <>
            <button
              className="history-toggle-btn mobile-only"
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              title="Historique des conversations"
            >
              <Menu size={20} />
            </button>
            
            <OliviaAvatar isSpeaking={isSpeaking && voiceEnabled && !silentMode} />
            <div className="chat-controls">
              <div className="chat__voice-toggle">
                <label title={voiceEnabled ? "Désactiver la voix" : "Activer la voix"}>
                  <input type="checkbox" checked={voiceEnabled} onChange={handleVoiceToggleChange}/>
                  Voix {voiceEnabled ? "🔊" : "🔇"}
                </label>
              </div>
              <div className="chat__silent-toggle">
                <label title={silentMode ? "Reprendre le dialogue" : "Mode écoute seule"}>
                  <input type="checkbox" checked={silentMode} onChange={() => setSilentMode(!silentMode)}/>
                  Écoute {silentMode ? "✍️" : "💬"}
                </label>
              </div>
            </div>
            <div className="history-chat-wrapper">
              <div className="history-chat">
                {/* DESKTOP : Affichage de l'historique directement ici */}
                <div className="desktop-history">
                  <h3>Conversations</h3>
                  <button className="new-conversation-btn-desktop" onClick={createNewConversation} title="Nouvelle conversation">
                    <Plus size={16} /> Nouveau
                  </button>
                  <div className="desktop-conversation-list">
                    {conversationHistory.length === 0 ? (
                      <p className="no-history-text">Aucune conversation</p>
                    ) : (
                      conversationHistory.slice(0, 5).map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`history-item ${currentConversationId === conversation.id ? 'active' : ''}`}
                          onClick={() => loadConversation(conversation.id)}
                          title={conversation.title}
                        >
                          <MessageCircle size={12} />
                          <span className="conversation-title">{conversation.title}</span>
                          <button
                            className="delete-conversation-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                            title="Supprimer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            {showConfirmClear && (
              <div className="confirmation-modal">
                <p>Créer une nouvelle conversation ?</p>
                <div className="confirmation-actions">
                  <button onClick={clearChatHistoryAndMessages}>Oui</button>
                  <button onClick={() => setShowConfirmClear(false)}>Non</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="journal-navigation-content">
            <img src={userProfileAvatar || "/images/default-avatar.png"} alt="Mon profil" className="profile-avatar-display"/>
            <h2>📖 Mon Carnet</h2>
          </div>
        )}
      </nav>

      <main className="main-content-area">
        <div className="mode-switcher">
          <button className={`btn-mode ${mode === "chat" ? "active" : ""}`} onClick={() => setMode("chat")}>
            💬 Dialogue avec Olivia
          </button>
          <button className={`btn-mode ${mode === "journal" ? "active" : ""}`} onClick={() => setMode("journal")}>
            📓 Mon Carnet Personnel
          </button>
        </div>

        {mode === "chat" ? (
          <div className="chat-interface-wrapper">
            <div className="chat-messages-container" ref={chatContainerRef} onScroll={handleScroll}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble-wrapper ${msg.from === "user" ? "user-message-wrapper" : "ai-message-wrapper"}`}>
                  <div className={`message-bubble ${msg.from === "user" ? "user-message" : "ai-message"}`}>
                    {msg.from === "model" 
                        ? formatResponse(msg.displayText) 
                        : <p>{msg.displayText}</p> // Le texte utilisateur est déjà simple
                    }
                  </div>
                  {msg.from === "model" && msg.actionName && msg.actionParams && (
                    <button 
                      className="btn btn--action-tag" 
                      onClick={() => handleActionClick(msg.actionName, msg.actionParams)}
                      title={`Action suggérée: ${msg.actionName.toLowerCase().replace(/_/g, ' ')}`}
                    >
                      {msg.actionName === "EXERCICE_RESPIRATION" && <><Zap size={16}/> Pratiquer</>}
                      {msg.actionName === "VOYAGE_SONORE" && <><Waves size={16}/> Écouter</>}
                      {msg.actionName === "SUGGESTION_JOURNAL" && <><BookOpen size={16}/> Écrire</>}
                      {msg.actionName === "INFO_STRESS" && <><Info size={16}/> Infos</>}
                      {msg.actionName === "REDIRECT" && <><ExternalLink size={16}/> Aller</>}
                      {!["EXERCICE_RESPIRATION", "VOYAGE_SONORE", "SUGGESTION_JOURNAL", "INFO_STRESS", "REDIRECT"].includes(msg.actionName) && 
                        `Suggestion: ${msg.actionName.toLowerCase().replace(/_/g, ' ')}`}
                    </button>
                  )}
                </div>
              ))}
              {/* Indicateur de chargement pour Olivia */}
              {loading && (
                <div className="message-bubble ai-message">
                  <p>Olivia est en train de réfléchir...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
              <button className="scroll-toggle-button" onClick={toggleScrollToPosition} title={isAtBottom && chatContainerRef.current && chatContainerRef.current.scrollTop > 0 ? "Remonter en haut" : "Aller en bas"}>
                {(isAtBottom && chatContainerRef.current && chatContainerRef.current.scrollTop > 0) || (!isAtBottom && chatContainerRef.current && chatContainerRef.current.scrollTop > 100)
                    ? <ArrowUpwardIcon fontSize="small"/>
                    : <ArrowDownwardIcon fontSize="small"/>}
              </button>
            )}

            {showScrollToTopButton && (
              <button className="scroll-to-top-button" onClick={scrollToTop} title="Remonter au début de la conversation">
                <ArrowUpIcon fontSize="small"/>
              </button>
            )}
            
            <div className="chat-input-area">
              <textarea placeholder="Écris ton message ici..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows="3" disabled={loading}/>
              <button onClick={sendMessage} disabled={loading || !input.trim()}>📨</button>
            </div>
          </div>
        ) : ( <Journal /> )}
      </main>
      {showEmergencyModal && (
        <div className="modal-backdrop">
          <div className="emergency-modal-content">
            <h2>Besoin d'aide immédiatement ?</h2>
            <p>
              Tu n'es pas seul·e. Appelle le <strong>3114</strong> (numéro
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

      {showDeleteModal && conversationToDelete && (
        <div className="modal-backdrop">
          <div className="delete-modal-content">
            <div className="delete-modal-header">
              <Trash2 size={24} className="delete-icon" />
              <h3>Supprimer la conversation</h3>
            </div>
            <div className="delete-modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette conversation ?</p>
              <div className="conversation-preview">
                <MessageCircle size={16} />
                <span>"{conversationToDelete.title}"</span>
              </div>
              <p className="warning-text">Cette action est irréversible.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={cancelDeleteConversation}>
                Annuler
              </button>
              <button className="btn-delete" onClick={confirmDeleteConversation}>
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;