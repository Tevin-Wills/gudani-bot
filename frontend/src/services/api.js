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
