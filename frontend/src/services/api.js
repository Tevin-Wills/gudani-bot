import { API_BASE_URL } from "../utils/constants";

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new NetworkError("Gudani Bot is currently sleeping. Please wait a moment and try again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

async function multipartRequest(endpoint, formData) {
  const url = `${API_BASE_URL}${endpoint}`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new NetworkError("Gudani Bot is currently sleeping. Please wait a moment and try again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export function healthCheck() {
  return request("/api/health");
}

export function ping() {
  return request("/api/ping");
}

export function getLanguages() {
  return request("/api/languages");
}

export function sendMessage(message, language, grade, conversationHistory) {
  return request("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      language: language === "auto" ? null : language,
      grade,
      conversation_history: conversationHistory,
    }),
  });
}

export function getSubjects() {
  return request("/api/quiz/subjects");
}

export function startQuiz({ subject, topic, grade, language, num_questions }) {
  return request("/api/quiz/start", {
    method: "POST",
    body: JSON.stringify({
      subject,
      topic: topic || null,
      grade,
      language: language === "auto" ? null : language,
      num_questions,
    }),
  });
}

export function submitAnswer({ quiz_id, question_id, answer }) {
  return request("/api/quiz/answer", {
    method: "POST",
    body: JSON.stringify({ quiz_id, question_id, answer }),
  });
}

export function getQuizSummary(quiz_id) {
  return request("/api/quiz/summary", {
    method: "POST",
    body: JSON.stringify({ quiz_id }),
  });
}

export function getFAQCategories() {
  return request("/api/faq/categories");
}

export function generateAnnouncement({ message, tone, source_language }) {
  return request("/api/announce", {
    method: "POST",
    body: JSON.stringify({ message, tone, source_language }),
  });
}

export function askFAQ({ question, language, category }) {
  return request("/api/faq", {
    method: "POST",
    body: JSON.stringify({
      question,
      language: language === "auto" ? null : language,
      category: category || null,
    }),
  });
}

// --- Image / vision ---

export function analyzeImage({ file, mode = "qa", language, prompt }) {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("mode", mode);
  if (language && language !== "auto") fd.append("language", language);
  if (prompt) fd.append("prompt", prompt);
  return multipartRequest("/api/media/analyze-image", fd);
}

// --- Voice (server-side fallback only) ---

export function transcribeAudio({ file, language }) {
  const fd = new FormData();
  fd.append("audio", file);
  if (language && language !== "auto") fd.append("language", language);
  return multipartRequest("/api/media/transcribe", fd);
}

export function synthesizeSpeech({ text, language }) {
  const fd = new FormData();
  fd.append("text", text);
  if (language && language !== "auto") fd.append("language", language);
  return multipartRequest("/api/media/synthesize", fd);
}

// --- Conversation history ---

export function listConversations() {
  return request("/api/history");
}

export function createConversation({ language, title, messages } = {}) {
  return request("/api/history", {
    method: "POST",
    body: JSON.stringify({ language, title, messages }),
  });
}

export function getConversation(id) {
  return request(`/api/history/${id}`);
}

export function updateConversation(id, { messages, title, language } = {}) {
  return request(`/api/history/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ messages, title, language }),
  });
}

export function deleteConversation(id) {
  return request(`/api/history/${id}`, { method: "DELETE" });
}

// --- Language learning ---

export function getPhraseOfTheDay() {
  return request("/api/learn/phrase-of-the-day");
}

export function getVocabulary(category) {
  const q = category ? `?category=${encodeURIComponent(category)}` : "";
  return request(`/api/learn/vocabulary${q}`);
}

export function listLessons() {
  return request("/api/learn/lessons");
}

export function getLesson(id) {
  return request(`/api/learn/lessons/${id}`);
}

export function translateText({ text, source = "en", target }) {
  return request("/api/learn/translate", {
    method: "POST",
    body: JSON.stringify({ text, source, target }),
  });
}

export function explainTerm({ text, language, explain_in = "en" }) {
  return request("/api/learn/explain", {
    method: "POST",
    body: JSON.stringify({ text, language, explain_in }),
  });
}

export function generatePractice({ language = "ve", category, count = 4 } = {}) {
  return request("/api/learn/practice", {
    method: "POST",
    body: JSON.stringify({ language, category, count }),
  });
}
