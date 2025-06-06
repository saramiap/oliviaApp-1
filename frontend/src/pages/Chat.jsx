import React, { useState, useRef, useEffect } from "react";
import OliviaAvatar from "../components/OliviaAvatar"; // Tu l'as déjà
import useSpeech from "../hooks/useSpeech";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useNavigate } from "react-router-dom";
import Journal from "./Journal"; // Importer le composant Journal
import { Zap, Waves, BookOpen, Info, ExternalLink } from 'lucide-react';
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

const parseActionTag = (text) => {
  const tagRegex = /#([A-Z_]+)\{([^}]+)\}/; // Regex pour #ACTION{params}
  const match = text.match(tagRegex);

  if (match) {
    const actionName = match[1];
    const paramsString = match[2];
    let params = {};
    try {
      // Tentative de parser les paramètres comme un objet JSON-like
      // Attention: ceci est une simplification. Une vraie grammaire ou un parser plus robuste serait mieux.
      // Pour des paires clé:"valeur", clé:nombre
      const paramPairs = paramsString.match(/(\w+)\s*:\s*("[^"]*"|\d+\.?\d*|true|false)/g);
      if (paramPairs) {
        paramPairs.forEach(pair => {
          const [key, valueString] = pair.split(/\s*:\s*/);
          let value = valueString;
          if (valueString.startsWith('"') && valueString.endsWith('"')) {
            value = valueString.slice(1, -1); // Enlève les guillemets
          } else if (!isNaN(parseFloat(valueString))) {
            value = parseFloat(valueString);
          } else if (valueString === 'true') {
            value = true;
          } else if (valueString === 'false') {
            value = false;
          }
          params[key] = value;
        });
      }
    } catch (e) {
      console.error("Erreur parsing des paramètres du tag:", e);
    }
    return { actionName, params, originalText: text.replace(tagRegex, "").trim() };
  }
  return { originalText: text, actionName: null, params: null }; // Retourne le texte original si pas de tag
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
    // Après une réponse de l'IA, on s'attend à ce que l'utilisateur soit en bas
    setIsAtBottom(true);
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
      const response = await fetch("/ask", { // URL relative pour le proxy et le déploiement
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }), // updatedMessages doit être défini avant
      });

      if (!response.ok) {
        // Si le serveur renvoie une erreur (4xx, 5xx)
        // Essayer de lire le message d'erreur JSON du backend
        let errorMsg = `Erreur HTTP ${response.status} - ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg; // Utilise le message du backend si disponible
        } catch (e) {
          // Si le corps de la réponse d'erreur n'est pas du JSON ou est vide
          console.warn("Impossible de parser la réponse d'erreur JSON du serveur.", e);
        }
        throw new Error(errorMsg); // Cela va au bloc catch
      }

      const data = await response.json(); // Parse la réponse JSON si response.ok est true

      let aiReply = data.response || "Désolée, je n'ai pas pu traiter cela.";
      const actionMatch = aiReply.match(/#goto:([a-zA-Z0-9_-]+)/);
      const shouldRedirect = Boolean(actionMatch);
      const redirectTarget = shouldRedirect ? actionMatch[1] : null;

      if (shouldRedirect) {
        aiReply = aiReply.replace(/#goto:[a-zA-Z0-9_-]+/, "");
      }

      handleAIResponse(
        aiReply,
        updatedMessages,
        redirectTarget,
        shouldRedirect
      );

    } catch (error) {
      console.error("Erreur IA ou réseau :", error);
      // error.message contiendra soit "Failed to fetch" (erreur réseau)
      // soit le message que nous avons construit avec "Erreur HTTP..."
      handleAIResponse(
        `Oups, quelque chose s'est mal passé : ${error.message}`,
        updatedMessages,
        null,
        false
      );
    } finally {
      setLoading(false); // Assure-toi que setLoading est défini quelque part
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
                {/* {silentMode && (
                  <small className="silent-mode-info">
                    Olivia n'interviendra pas.
                  </small>
                )} */}
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

            {showScrollButton && (
              <button className="scroll-toggle-button" onClick={toggleScrollToPosition} title={isAtBottom ? "Remonter en haut" : "Aller en bas"}>
                {isAtBottom ? <ArrowUpwardIcon fontSize="small"/> : <ArrowDownwardIcon fontSize="small"/>}
              </button>
            )}

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
