import axios from "axios";

const api = axios.create({
  baseURL: "https://resume-ai-agent-production.up.railway.app",
});

/* ================= RESUME PARSER ================= */
export const uploadResumePDF = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const response = await api.post("/api/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/* ================= RAG AI CHAT ================= */
export const askAI = async (question) => {
  const response = await api.post("/api/ai/ask", { question });
  return response.data;
};

export const sendChatMessage = async (prompt) => {
  return askAI(prompt);
};

export default api;