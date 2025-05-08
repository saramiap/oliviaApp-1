import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import OliviaAvatar from "../components/OliviaAvatar"; // Tu l'as déjà
import useSpeech from "../hooks/useSpeech";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";
import Journal from "./Journal"; // Importer le composant Journal

import "../styles/_chat.scss"; // Nous allons créer/modifier ce fichier SCSS

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

const Chat = () => {
  // Renommé pour plus de clarté, mais tu peux garder Chat
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false); // Penser à implémenter la logique d'affichage de ce bouton
  const [history, setHistory] = useState([]); // Historique des conversations du chat
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [silentMode, setSilentMode] = useState(false); // Pour le mode "vider son sac"
  // const [journal, setJournal] = useState([]); // Cet état 'journal' était spécifique au chat, à clarifier si besoin

  const [mode, setMode] = useState("chat"); // "chat" ou "journal"
  const [userProfileAvatar, setUserProfileAvatar] = useState("");

  const messagesEndRef = useRef(null);
  const { speak, isSpeaking } = useSpeech(false); // Initialiser useSpeech avec la voix désactivée par défaut

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

  const handleVoiceToggleChange = (event) => {
    setVoiceEnabled(event.target.checked);
  };

  const containsEmergencyKeyword = (text) =>
    EMERGENCY_KEYWORDS.some((word) => text.toLowerCase().includes(word));

  const handleAIResponse = (
    aiReply,
    currentMessages,
    redirectTarget,
    shouldRedirect
  ) => {
    const aiMessage = { from: "model", text: aiReply };
    const finalMessages = [...currentMessages, aiMessage]; // Utiliser currentMessages passé en argument
    setMessages(finalMessages);
    // Sauvegarder la conversation complète dans l'historique
    setHistory((prev) => [...prev, { date: new Date(), convo: finalMessages }]); // Ceci ajoute chaque échange comme une nouvelle convo, vérifier si c'est le but
    if (shouldRedirect) {
      setPendingAction(redirectTarget);
    }
    if (voiceEnabled && !silentMode) {
      // Ne pas parler en mode silencieux
      speak(aiReply);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    let updatedMessages = [...messages, userMessage]; // Renommé pour clarté, anciennement 'updated'

    if (silentMode) {
      setMessages(updatedMessages);
      setInput("");
      return;
    }

    if (containsEmergencyKeyword(input.toLowerCase())) {
      const emergencyMsg = `Tu n'es pas seul·e. Il semble que tu sois en détresse. Je peux te diriger vers une page d’urgence avec des ressources utiles.`;
      setMessages([...updatedMessages, { from: "model", text: emergencyMsg }]);

      // if (voiceEnabled) speak(emergencyMsg);
      setPendingAction("urgence");
      setShowEmergencyModal(true);
      setInput("");
      return;
    }

    setMessages(updatedMessages); // Affiche le message de l'utilisateur immédiatement
    const currentInput = input; // Conserve la valeur de input avant de le vider
    setInput("");
    setLoading(true);

    try {
      // Utilise directement updatedMessages comme avant pour l'appel API
      const res = await axios.post("http://localhost:3000/ask", {
        messages: updatedMessages, // REVENIR À CETTE LIGNE, comme dans ton code original
      });

      let aiReply =
        res.data.response || "Désolée, je n'ai pas pu traiter cela.";
      const actionMatch = aiReply.match(/#goto:([a-zA-Z0-9_-]+)/);
      const shouldRedirect = Boolean(actionMatch);
      const redirectTarget = shouldRedirect ? actionMatch[1] : null;

      if (shouldRedirect) {
        aiReply = aiReply.replace(/#goto:[a-zA-Z0-9_-]+/, "");
      }

      // Passe updatedMessages à handleAIResponse pour qu'il ajoute la réponse de l'IA
      // à la suite des messages existants (y compris le dernier message utilisateur)
      handleAIResponse(
        aiReply,
        updatedMessages,
        redirectTarget,
        shouldRedirect
      );
    } catch (error) {
      console.error("Erreur IA :", error);
      // En cas d'erreur, ajoute un message d'erreur à la suite des messages actuels
      handleAIResponse(
        "Oups, quelque chose s'est mal passé avec ma réflexion.",
        updatedMessages,
        null,
        false
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  return (
    <div className="chat-journal-layout">
      <nav className="page-navigation">
        {mode === "chat" ? (
          <>
            <OliviaAvatar isSpeaking={isSpeaking && voiceEnabled} />{" "}
            {/* L'avatar réagit si la voix est activée ET qu'elle parle */}
            <div className="chat__voice-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={handleVoiceToggleChange}
                />
                Voix {voiceEnabled ? "🔊" : "🔇"}
              </label>
            </div>
            <div className="chat__silent-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={silentMode}
                  onChange={() => setSilentMode(!silentMode)}
                />
                Mode Écoute {silentMode ? "✍️" : "💬"}
              </label>
              {silentMode && (
                <small className="silent-mode-info">
                  Olivia n'interviendra pas.
                </small>
              )}
            </div>
            <div className="history-chat">
              <h3>Historique Chat</h3>
              {history.length > 0 ? (
                history.map((conv, idx) => (
                  <div key={idx} className="history-item">
                    {/* Adapter l'affichage de l'historique */}
                    Conversation du {new Date(conv.date).toLocaleDateString()}
                  </div>
                ))
              ) : (
                <p>Aucun historique.</p>
              )}
              {messages.length > 2 && ( // Afficher si plus que le message initial
                <button
                  className="clear-history-btn"
                  onClick={() => setShowConfirmClear(true)}
                >
                  🗑️ Effacer Chat Actuel
                </button>
              )}
            </div>
            {showConfirmClear && (
              <div className="confirmation-modal">
                <p>Effacer la conversation actuelle et l'historique ?</p>
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
          // mode === "journal"
          <div className="journal-navigation-content">
            <img
              src={userProfileAvatar}
              alt="Mon profil"
              className="profile-avatar-display"
            />
            <h2>📖 Mon Carnet</h2>
            {/* La navigation des sessions du journal sera gérée par le composant Journal lui-même */}
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
            <div className="chat-messages-container">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message-bubble ${
                    msg.from === "user" ? "user-message" : "ai-message"
                  }`}
                >
                  {/* Applique formatResponse pour les messages de l'IA, 
                      pour les messages utilisateur, on les affiche tels quels dans un <p> 
                      (si tu veux aussi gérer les \n pour l'utilisateur, il faudrait appliquer une logique similaire) */}
                  {msg.from === "model" ? (
                    formatResponse(msg.text)
                  ) : (
                    <p>{msg.text}</p>
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

            {/* Bouton Scroll to bottom (logique d'affichage à implémenter) */}
            {/* {showScroll && (
              <div className="scroll-to-bottom" onClick={scrollToBottom}>
                <ArrowDownwardIcon />
              </div>
            )} */}

            {pendingAction &&
              !showEmergencyModal && ( // Ne pas afficher si la modale d'urgence est active
                <div className="chat-confirmation-prompt">
                  <p>
                    Souhaites-tu que je t’emmène vers un espace de détente ?
                  </p>
                  <button
                    onClick={() => {
                      navigate(`/${pendingAction}`);
                      setPendingAction(null);
                    }}
                  >
                    Oui, j’y vais
                  </button>
                  <button onClick={() => setPendingAction(null)}>
                    Non, merci
                  </button>
                </div>
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
