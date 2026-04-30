import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import {
  sendMessage,
  analyzeImage,
  createConversation,
  updateConversation,
  getConversation,
  NetworkError,
} from "../../services/api";
import { LANGUAGES } from "../../utils/constants";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import HistorySidebar from "./HistorySidebar";

const WELCOME_MESSAGES = {
  en: "Welcome to Gudani Bot! I'm your community and learning assistant.",
  af: "Welkom by Gudani Bot! Ek is jou gemeenskap- en leerhulp.",
  zu: "Siyakwamukela ku-Gudani Bot! Ngingumsizi womphakathi nokufunda.",
  xh: "Wamkelekile kuGudani Bot! Ndingumncedi woluntu nokufunda.",
  st: "Rea o amohela ho Gudani Bot! Ke mothusi wa setjhaba le ho ithuta.",
  tn: "O amogetswe mo go Gudani Bot! Ke mothusi wa baagi le go ithuta.",
  nso: "O amogelegile go Gudani Bot! Ke mothuši wa setšhaba le go ithuta.",
  ts: "Xewani eka Gudani Bot! Ndzi mupfuni wa muganga na ku dyondza.",
  ve: "Vho tanganedzwa kha Gudani Bot! Ndi mupfuni wa tshitshavha na u guda.",
};

const QUICK_CARDS = [
  { emoji: "📚", label: "Help with homework", message: "I need help with my homework" },
  { emoji: "🇿🇦", label: "Translate something", message: "Help me translate something to another South African language" },
  { emoji: "📝", label: "Explain a form", message: "I have a form or document I don't understand. Can you help?" },
  { emoji: "🗣️", label: "Learn Tshivenda", message: "Teach me a few useful Tshivenda phrases" },
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
      <p className="font-jakarta text-gray-600 dark:text-gray-300 mb-2 max-w-md animate-message-in">
        {greeting}
      </p>
      <p className="font-jakarta text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-md animate-message-in">
        Ask in any of 9 South African languages · attach an image · use the mic
      </p>
      <span className="inline-block px-3 py-1 rounded-full bg-teal-primary/10 dark:bg-teal-light/20 text-teal-primary dark:text-teal-light text-sm font-jakarta mb-8 animate-message-in">
        {lang?.native_name || "Auto-detect"}
      </span>
      <div className="flex flex-wrap justify-center gap-3">
        {QUICK_CARDS.map((card) => (
          <button
            key={card.label}
            onClick={() => onQuickStart(card.message)}
            aria-label={card.label}
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

export default function ChatWindow({ clearKey }) {
  const { language, grade } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const bottomRef = useRef(null);

  // Reset on Clear Chat (and start a new conversation context).
  useEffect(() => {
    setMessages([]);
    setAttachedImage(null);
    setConversationId(null);
  }, [clearKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const persistMessages = useCallback(
    async (nextMessages, lang) => {
      // Strip ephemeral fields (e.g. blob URLs) before persisting.
      const cleaned = nextMessages.map((m) => ({
        role: m.role,
        content: m.content || "",
        timestamp: m.timestamp,
        detected_language: m.detected_language || null,
        translated: m.translated ?? null,
      }));
      try {
        if (!conversationId) {
          const created = await createConversation({ language: lang, messages: cleaned });
          setConversationId(created.id);
        } else {
          await updateConversation(conversationId, { messages: cleaned, language: lang });
        }
        setHistoryRefreshKey((k) => k + 1);
      } catch (err) {
        // Persistence is best-effort — don't break chat if backend is offline.
        console.warn("[gudani] history persist failed:", err.message);
      }
    },
    [conversationId],
  );

  async function handleSend(text, image) {
    const userImageUrl = image ? URL.createObjectURL(image) : null;
    const userMsg = {
      role: "user",
      content: text || (image ? "(image)" : ""),
      timestamp: formatTime(),
      detected_language: language === "auto" ? null : language,
      image_url: userImageUrl,
    };
    const messagesWithUser = [...messages, userMsg];
    setMessages(messagesWithUser);
    setLoading(true);
    setAttachedImage(null);

    try {
      let data;
      if (image) {
        // Image-mode call: send to vision endpoint.
        data = await analyzeImage({
          file: image,
          mode: "qa",
          language,
          prompt: text || undefined,
        });
        data = {
          response: data.response,
          detected_language: data.language,
          translated: false,
        };
      } else {
        const history = messagesWithUser.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        data = await sendMessage(text, language, grade, history);
      }

      const botMsg = {
        role: "assistant",
        content: data.response,
        timestamp: formatTime(),
        detected_language: data.detected_language,
        translated: data.translated,
      };

      const finalMessages = [
        ...messagesWithUser.map((m, idx) =>
          idx === messagesWithUser.length - 1 && m.role === "user" && !m.detected_language
            ? { ...m, detected_language: data.detected_language }
            : m,
        ),
        botMsg,
      ];
      setMessages(finalMessages);
      persistMessages(finalMessages, data.detected_language);
    } catch (err) {
      let content;
      if (err instanceof NetworkError) {
        content = "Gudani Bot is currently sleeping. Please wait a moment and try again.";
      } else if (err.message?.toLowerCase().includes("image")) {
        content = `I had trouble with that image: ${err.message}`;
      } else if (err.message?.includes("translat")) {
        content = "Translation unavailable — showing English";
      } else {
        content = "I had trouble thinking about that. Can you try asking differently?";
      }
      const errorMsg = { role: "assistant", content, timestamp: formatTime() };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectConversation(id) {
    try {
      const convo = await getConversation(id);
      setConversationId(convo.id);
      setMessages(
        (convo.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || "",
          detected_language: m.detected_language,
          translated: m.translated,
        })),
      );
      setAttachedImage(null);
    } catch (err) {
      alert("Could not load conversation: " + err.message);
    }
  }

  function handleNewConversation() {
    setMessages([]);
    setConversationId(null);
    setAttachedImage(null);
  }

  return (
    <div className="flex flex-col h-full relative">
      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        activeConversationId={conversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        refreshKey={historyRefreshKey}
      />
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => setHistoryOpen(true)}
          aria-label="Show past chats"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-jakarta text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 1 0 1.06-1.06l-2.78-2.78V5Z" clipRule="evenodd" />
          </svg>
          Past chats
        </button>
        {conversationId && (
          <span className="text-[10px] font-jakarta text-gray-400">
            saved · {conversationId.slice(0, 6)}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900">
        {messages.length === 0 ? (
          <WelcomeScreen onQuickStart={(text) => handleSend(text, null)} />
        ) : (
          <div className="py-4">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                message={msg}
                onExplainSimpler={msg.role === "assistant" ? (text) => handleSend(text, null) : undefined}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <MessageInput
        onSend={handleSend}
        disabled={loading}
        attachedImage={attachedImage}
        onImageSelected={setAttachedImage}
        onClearImage={() => setAttachedImage(null)}
      />
    </div>
  );
}
