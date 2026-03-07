import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export const addMemory = async (text, reminder_time = null, reminder_email = null) => {
  const payload = { text };
  if (reminder_time) payload.reminder_time = reminder_time;
  if (reminder_email) payload.reminder_email = reminder_email;
  const res = await API.post("/memory", payload);
  return res.data;
};

export const chat = async (query) => {
  const res = await API.post("/chat", { query });
  return res.data;
};

export const getMemories = async () => {
  const res = await API.get("/memories");
  return res.data;
};
