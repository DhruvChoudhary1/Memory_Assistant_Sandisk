import { useState, useRef } from "react";
import { chat } from "../api";

export default function ChatUI() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const sendQuery = async () => {
    if (!query.trim()) return;
    const userQuery = query.trim();
    setQuery("");
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: userQuery }]);
    try {
      const data = await chat(userQuery);
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to get answer");
      setQuery(userQuery);
    } finally {
      setLoading(false);
    }
  };

  // Voice to text logic
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript);
      };
      recognitionRef.current.onerror = (event) => {
        setListening(false);
      };
      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
    if (!listening) {
      setListening(true);
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="chat-ui card">
      <div className="messages">
        {messages.length === 0 && (
          <p className="placeholder">Ask anything about your stored memories...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "Memory OS"}:</strong> {msg.text}
          </div>
        ))}
        {loading && <div className="message message-ai typing">Thinking...</div>}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="chat-input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuery()}
          placeholder="Ask your memories..."
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={handleMicClick}
          disabled={loading}
          style={{ background: listening ? '#e0e0e0' : 'white', border: '1px solid #ccc', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}
          title={listening ? 'Listening...' : 'Voice to text'}
        >
          <span role="img" aria-label="mic" style={{ color: listening ? 'red' : '#555', fontSize: 20 }}>
            🎤
          </span>
        </button>
        <button onClick={sendQuery} disabled={loading || !query.trim()}>
          Ask
        </button>
      </div>
    </div>
  );
}
