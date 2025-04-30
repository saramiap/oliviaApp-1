import { useState, useRef, useEffect } from "react";
import axios from "axios";
import OliviaAvatar from "../components/OliviaAvatar";
import useSpeech from "../hooks/useSpeech";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";

const EMERGENCY_KEYWORDS = [
  "suicide", "je veux mourir", "tuer", "plus envie de vivre", 
  "violence", "je me fais mal", "je suis en danger", "j’ai besoin d’aide",
  "je vais mal", "pensées suicidaires", "on m’a agressé", "je me sens en insécurité"
];

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [history, setHistory] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [alerte, setAlerte] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const messagesEndRef = useRef(null);
  const { speak, isSpeaking } = useSpeech(voiceEnabled);

  useEffect(() => {
    const stored = localStorage.getItem("chatMessages");
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([{ from: "model", text: "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd’hui." }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const containsEmergencyKeyword = (text) =>
    EMERGENCY_KEYWORDS.some((word) => text.toLowerCase().includes(word));

  const handleAIResponse = (aiReply, updated, redirectTarget, shouldRedirect) => {
    const aiMessage = { from: "model", text: aiReply };
    const finalMessages = [...updated, aiMessage];
    setMessages(finalMessages);
    setHistory((prev) => [...prev, { date: new Date(), convo: finalMessages }]);
    if (shouldRedirect) {
      setPendingAction(redirectTarget);
    } else {
      speak(aiReply);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updated = [...messages, { from: "user", text: input }];
    const inputLower = input.toLowerCase();

    if (containsEmergencyKeyword(inputLower)) {
      const emergencyMsg = `Tu n'es pas seul·e. Il semble que tu sois en détresse. Je peux te diriger vers une page d’urgence avec des ressources utiles.`;
      setMessages([...updated, { from: "model", text: emergencyMsg }]);
      speak(emergencyMsg);
      setPendingAction("urgence");
      setShowEmergencyModal(true); // Affiche le modal
      setInput("");
      return;
    }

    setMessages(updated);
    setInput("");
    setLoading(true);
    setAlerte(null);

    try {
      const res = await axios.post("http://localhost:3000/ask", {
        messages: updated,
      });

      let aiReply = res.data.response || "";
      const actionMatch = aiReply.match(/#goto:([a-zA-Z0-9_-]+)/);
      const shouldRedirect = Boolean(actionMatch);
      const redirectTarget = shouldRedirect ? actionMatch[1] : null;

      if (shouldRedirect) {
        aiReply = aiReply.replace(/#goto:[a-zA-Z0-9_-]+/, "");
      }

      handleAIResponse(aiReply, updated, redirectTarget, shouldRedirect);
    } catch (error) {
      console.error("Erreur IA :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScroll(scrollHeight - scrollTop > clientHeight + 200);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("chatMessages");
    setMessages([{ from: "model", text: "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd’hui." }]);
    setShowConfirmClear(false);
  };

  const formatResponse = (text) =>
    text.split(/\n+/).filter((line) => line.trim() !== "").map((line, i) => <p key={i}>• {line.trim()}</p>);

  return (
    <div className="layout">
      <aside className="sidebar">
        <OliviaAvatar isSpeaking={isSpeaking} />
        <div className="chat__voice-toggle">
          <label>
            <input type="checkbox" checked={voiceEnabled} onChange={() => setVoiceEnabled(!voiceEnabled)} />
            Voix {voiceEnabled ? "activée 🔊" : "désactivée 🔇"}
          </label>
        </div>

        <div className="history">
          <h3>Historique</h3>
          {history.map((conv, idx) => (
            <div key={idx} className="history-item">Conversation {idx + 1}</div>
          ))}
          <button className="clear-history-btn" onClick={() => setShowConfirmClear(true)}>
            🗑️ Effacer l'historique
          </button>
        </div>

        {showConfirmClear && (
          <div className="confirmation-modal">
            <p>Es-tu sûr·e de vouloir supprimer l’historique ?</p>
            <div className="confirmation-actions">
              <button onClick={clearHistory}>Oui, supprimer</button>
              <button onClick={() => setShowConfirmClear(false)}>Non, annuler</button>
            </div>
          </div>
        )}
      </aside>

      <div className="chat-container">
        <div className="chat-messages" onScroll={handleScroll}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat__message ${msg.from === "user" ? "chat__user" : "chat__ai"}`}>
              {msg.from === "model" ? formatResponse(msg.text) : msg.text}
            </div>
          ))}
          {loading && <div className="chat__message chat__ai">Olivia est en train de réfléchir...</div>}
          <div ref={messagesEndRef} />
        </div>

        {showScroll && (
          <div className="scroll-to-bottom" onClick={scrollToBottom}>
            <ArrowDownwardIcon />
          </div>
        )}

        {pendingAction && (
          <div className="chat__confirmation">
            <p>Souhaites-tu que je t’emmène vers un espace de détente ?</p>
            <button onClick={() => { navigate(`/${pendingAction}`); setPendingAction(null); }}>
              Oui, j’y vais
            </button>
            <button onClick={() => setPendingAction(null)}>Non, merci</button>
          </div>
        )}

        <div className="chat-input-wrapper">
          <div className="chat-input">
            <input
              type="text"
              placeholder="Écris ton message ici..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage}>📨</button>
          </div>
        </div>
      </div>

      {showEmergencyModal && (
        <div className="modal-backdrop">
          <div className="emergency-modal">
            <h2>Besoin d’aide immédiatement ?</h2>
            <p>Tu n’es pas seul·e. Appelle le <strong>3114</strong>, numéro d'écoute 24/7.</p>
            <a href="/urgence" className="btn-urgence">Voir les ressources</a>
            <button onClick={() => setShowEmergencyModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
