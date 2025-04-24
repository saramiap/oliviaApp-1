import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/Chat.scss";
import OliviaAvatar from "../components/OliviaAvatar";
import useSpeech from "../hooks/useSpeech";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [history, setHistory] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const { speak, isSpeaking } = useSpeech();
  useEffect(() => {
    const stored = localStorage.getItem("chatMessages");
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);
  
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const context = messages
    .map((m) => `${m.from === "user" ? "Utilisateur" : "Olivia"} : ${m.text}`)
    .join("\n");
  
    try {
      const res = await axios.post("http://localhost:3000/ask", {
        messages: [...messages, { from: "user", text: input }],
      });
      

      const aiReply = res.data.response;
      const updatedMessages = [...newMessages, { from: "olivia", text: aiReply }];
      setMessages(updatedMessages);
      speak(aiReply, voiceEnabled);


      // Sauvegarde dans l'historique
      setHistory((prev) => [...prev, { date: new Date(), convo: updatedMessages }]);
    } catch (error) {
      console.error("Erreur IA :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScroll(scrollHeight - scrollTop > clientHeight + 200);
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

 useEffect(() => {
  if (messages.length === 0) {
    setMessages([
      {
        from: "olivia",
        text:
          "Bonjour, je suis là pour t’écouter. Dis-moi ce que tu ressens ou ce dont tu as besoin aujourd’hui.",
      },
    ]);
  }
}, []);

  

  const formatResponse = (text) =>
    text.split(/\n\s*\n/).map((chunk, i) => <p key={i}>{chunk.trim()}</p>);

  return (
    <div className="layout">
      <aside className="sidebar">
        <OliviaAvatar isSpeaking={isSpeaking} />
        <div className="chat__voice-toggle">
  <label>
    <input
      type="checkbox"
      checked={voiceEnabled}
      onChange={() => setVoiceEnabled(!voiceEnabled)}
    />
    Voix {voiceEnabled ? "activée 🔊" : "désactivée 🔇"}
  </label>
</div>

        <div className="history">
          <h3>Historique</h3>
          {history.map((conv, idx) => (
            <div key={idx} className="history-item">
              Conversation {idx + 1}
            </div>
          ))}
        </div>
      </aside>

      <div className="chat-container">
        <div className="chat-messages" onScroll={handleScroll}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat__message ${
                msg.from === "user" ? "chat__user" : "chat__ai"
              }`}
            >
              {msg.from === "olivia" ? formatResponse(msg.text) : msg.text}
            </div>
          ))}
          {loading && (
            <div className="chat__message chat__ai">
              Olivia est en train de réfléchir...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScroll && (
          <div className="scroll-to-bottom" onClick={scrollToBottom}>
            <ArrowDownwardIcon />
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
    </div>
  );
};

export default Chat;
