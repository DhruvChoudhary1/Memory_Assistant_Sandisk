import { useState, useRef } from "react";
import { addMemory } from "../api";

export default function MemoryForm({ onStored }) {
  const [memory, setMemory] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderEmail, setReminderEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const submitMemory = async () => {
    if (!memory.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addMemory(
        memory.trim(),
        reminderTime ? new Date(reminderTime).toISOString() : null,
        reminderEmail.trim() || null
      );
      setMemory("");
      setReminderTime("");
      setReminderEmail("");
      onStored?.();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to store memory");
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
        setMemory((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript);
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
    <div className="memory-form card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <textarea
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
          placeholder="Write your memory..."
          rows={4}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={handleMicClick}
          disabled={loading}
          style={{ background: listening ? '#e0e0e0' : 'white', border: '1px solid #ccc', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={listening ? 'Listening...' : 'Voice to text'}
        >
          <span role="img" aria-label="mic" style={{ color: listening ? 'red' : '#555', fontSize: 20 }}>
            🎤
          </span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          type="datetime-local"
          value={reminderTime}
          onChange={e => setReminderTime(e.target.value)}
          disabled={loading}
          style={{ flex: 1 }}
          placeholder="Reminder time"
        />
        <input
          type="email"
          value={reminderEmail}
          onChange={e => setReminderEmail(e.target.value)}
          disabled={loading}
          style={{ flex: 1 }}
          placeholder="Reminder email"
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button onClick={submitMemory} disabled={loading || !memory.trim()}>
        {loading ? "Storing..." : "Store Memory"}
      </button>
    </div>
  );
}
