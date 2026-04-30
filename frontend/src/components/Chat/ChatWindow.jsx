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
  en: "I'm Gudani, your community assistant. Ask anything — translation, forms, local info, language help, schoolwork.",
  af: "Ek is Gudani, jou gemeenskapshelper. Vra enigiets — vertalings, vorms, plaaslike inligting, taalhulp, skoolwerk.",
  zu: "Ngingu-Gudani, umsizi womphakathi. Buza noma yini — ukuhumusha, amafomu, ulwazi lwasekhaya, usizo lolimi, umsebenzi wesikole.",
  xh: "Ndingu-Gudani, umncedi woluntu. Buza nantoni na — uguqulelo, iifomu, ulwazi loluntu, uncedo lolwimi, umsebenzi wesikolo.",
  st: "Ke 'na Gudani, mothusi wa setjhaba. Botsa eng kapa eng — phetolelo, diforomo, tlhahisoleseding ya lehae, thuso ya puo, mosebetsi wa sekolo.",
  tn: "Ke nna Gudani, mothusi wa baagi. Botsa sengwe le sengwe — thanolo, diforomo, tshedimosetso ya selegae, thuso ya puo, tiro ya sekolo.",
  nso: "Ke nna Gudani, mothuši wa setšhaba. Botšiša selo se sengwe le se sengwe — phetolelo, diforomo, tshedimošo ya selegae, thušo ya polelo, mošomo wa sekolo.",
  ts: "Hi mina Gudani, mupfuni wa muganga. Vutisa nchumu wihi na wihi — vuhundzuluxeri, mafomo, vuxokoxoko bya laha kaya, mpfuno wa ririmi, ntirho wa xikolo.",
  ve: "Ndi nne Gudani, mupfuni wa tshitshavha. Vhudzisani tshithu naho tshi tshini — u thanyula, fomo, mafhungo a vundu, thuso ya luambo, mushumo wa tshikolo.",
};

// Community-first ordering: everyday/community use cases first, schoolwork last.
const QUICK_CARDS = [
  {
    emoji: "🌍",
    label: "Translate something",
    message: "Help me translate something to another South African language",
  },
  {
    emoji: "📄",
    label: "Explain a form",
    message: "I have a form or document I don't fully understand. Can you help me?",
  },
  {
    emoji: "🗣️",
    label: "Learn Tshivenda",
    message: "Teach me a few useful Tshivenda phrases",
  },
  {
    emoji: "🏘️",
    label: "Community info",
    message: "I have a question about my community or local services",
  },
  {
    emoji: "📸",
    label: "Read an image",
    message: "I'd like to send a photo and ask about it",
  },
  {
    emoji: "📚",
    label: "Schoolwork help",
    message: "I need help with my schoolwork",
  },
];

function WelcomeScreen({ onQuickStart }) {
  const { language } = useApp();
  const lang = LANGUAGES.find((l) => l.code === language);
  const greeting = WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en;

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-2xl text-center">
        <img
          src="/gudani-icon.svg"
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 animate-message-in"
        />
        <h2 className="font-jakarta font-bold text-2xl sm:text-3xl text-teal-primary dark:text-white mb-2 animate-message-in">
          Gudani!
        </h2>
        <p className="font-jakarta text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2 max-w-lg mx-auto animate-message-in">
          {greeting}
        </p>
        <p className="font-jakarta text-xs text-gray-500 dark:text-gray-400 mb-5 animate-message-in">
          9 South African languages · text · image · voice
        </p>
        <span className="inline-block px-3 py-1 rounded-full bg-teal-primary/10 dark:bg-teal-light/20 text-teal-primary dark:text-teal-light text-xs font-jakarta mb-6 animate-message-in">
          {lang?.native_name || "Auto-detect"}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {QUICK_CARDS.map((card) => (
            <button
              key={card.label}
              onClick={() => onQuickStart(card.message)}
              aria-label={card.label}
              className="flex flex-col items-center gap-1.5 px-3 py-4 sm:py-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-jakarta text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:border-teal-primary hover:shadow-md dark:hover:border-teal-light transition-all animate-message-in"
            >
              <span className="text-2xl" aria-hidden="true">{card.emoji}</span>
              <span className="font-medium leading-snug text-center">{card.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWindow({ clearKey, historyOpen = false, onCloseHistory }) {
  const { language, grade } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const bottomRef = useRef(null);

  // Reset on Clear Chat / New Chat (and start a new conversation context).
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
        onClose={onCloseHistory}
        activeConversationId={conversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        refreshKey={historyRefreshKey}
      />
      <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900">
        {messages.length === 0 ? (
          <WelcomeScreen onQuickStart={(text) => handleSend(text, null)} />
        ) : (
          <div className="py-4">
            {conversationId && (
              <p className="text-center text-[10px] font-jakarta text-gray-400 mb-2">
                saved · {conversationId.slice(0, 6)}
              </p>
            )}
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
