import { API_BASE_URL } from "../utils/constants";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export function healthCheck() {
  return request("/api/health");
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

export function startQuiz({ subject, grade, language, num_questions }) {
  return request("/api/quiz/start", {
    method: "POST",
    body: JSON.stringify({ subject, grade, language, num_questions }),
  });
}

export function submitAnswer({ question, student_answer, correct_answer, language }) {
  return request("/api/quiz/answer", {
    method: "POST",
    body: JSON.stringify({ question, student_answer, correct_answer, language }),
  });
}

export function askFAQ({ question, language }) {
  return request("/api/faq", {
    method: "POST",
    body: JSON.stringify({ question, language }),
  });
}
