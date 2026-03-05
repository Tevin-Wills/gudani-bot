import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { sendMessage } from "../../services/api";
import { LANGUAGES } from "../../utils/constants";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

const WELCOME_MESSAGES = {
  en: "Welcome to Gudani Bot! I'm here to help you learn.",
  af: "Welkom by Gudani Bot! Ek is hier om jou te help leer.",
  zu: "Siyakwamukela ku-Gudani Bot! Ngilapha ukukusiza ufunde.",
  xh: "Wamkelekile kuGudani Bot! Ndikho apha ukukunceda ufunde.",
  st: "Rea o amohela ho Gudani Bot! Ke mona ho o thusa ho ithuta.",
  tn: "O amogetswe mo go Gudani Bot! Ke fano go go thusa go ithuta.",
  nso: "O amogelegile go Gudani Bot! Ke mo go go thusa go ithuta.",
  ts: "Xewani eka Gudani Bot! Ndzi laha ku ku pfuna ku dyondza.",
  ve: "Vho tanganedzwa kha Gudani Bot! Ndi fhano u ni thusa u guda.",
};

const QUICK_CARDS = [
  { emoji: "\uD83D\uDCDA", label: "Help with homework", message: "I need help with my homework" },
  { emoji: "\uD83D\uDCDD", label: "Practice for exams", message: "Help me practice for my exams" },
  { emoji: "\u2753", label: "School information", message: "I have a question about school" },
];

function WelcomeScreen({ onQuickStart }) {
  const { language } = useApp();
  const lang = LANGUAGES.find((l) => l.code === language);
  const greeting = WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <img src="/gudani-icon.svg" alt="Gudani Bot" className="w-20 h-20 mb-5 animate-message-in" />
      <h2 className="font-jakarta font-bold text-2xl text-teal-primary dark:text-white mb-2 animate-message-in">
        Gudani!
      </h2>
      <p className="font-jakarta text-gray-600 dark:text-gray-300 mb-4 max-w-md animate-message-in">
        {greeting}
      </p>
      <span className="inline-block px-3 py-1 rounded-full bg-teal-primary/10 dark:bg-teal-light/20 text-teal-primary dark:text-teal-light text-sm font-jakarta mb-8 animate-message-in">
        {lang?.native_name || "Auto-detect"}
      </span>
      <div className="flex flex-wrap justify-center gap-3">
        {QUICK_CARDS.map((card) => (
          <button
            key={card.label}
            onClick={() => onQuickStart(card.message)}
            className="flex flex-col items-center gap-2 w-36 px-4 py-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-jakarta text-sm text-gray-700 dark:text-gray-200 hover:border-teal-primary hover:shadow-md dark:hover:border-teal-light transition-all animate-message-in"
          >
            <span className="text-2xl">{card.emoji}</span>
            <span className="font-medium">{card.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWindow({ onClearChat, clearKey }) {
  const { language, grade } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Reset messages when clearKey changes
  useEffect(() => {
    setMessages([]);
  }, [clearKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    const userMsg = {
      role: "user",
      content: text,
      timestamp: formatTime(),
      detected_language: language === "auto" ? null : language,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await sendMessage(text, language, grade, history);

      const botMsg = {
        role: "assistant",
        content: data.response,
        timestamp: formatTime(),
        detected_language: data.detected_language,
        translated: data.translated,
      };

      setMessages((prev) => {
        const updated = [...prev];
        const lastUserIdx = updated.length - 1;
        if (updated[lastUserIdx].role === "user" && !updated[lastUserIdx].detected_language) {
          updated[lastUserIdx] = {
            ...updated[lastUserIdx],
            detected_language: data.detected_language,
          };
        }
        return [...updated, botMsg];
      });
    } catch {
      const errorMsg = {
        role: "assistant",
        content: "Eish! Something went wrong. Please try again.",
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900">
        {messages.length === 0 ? (
          <WelcomeScreen onQuickStart={handleSend} />
        ) : (
          <div className="py-4">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                message={msg}
                onExplainSimpler={msg.role === "assistant" ? handleSend : undefined}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
