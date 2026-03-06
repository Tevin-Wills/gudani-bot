import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { getFAQCategories, askFAQ } from "../../services/api";

const CATEGORY_EMOJI = {
  fees: "💰",
  term_dates: "📅",
  admissions: "📋",
  uniform: "👔",
  transport: "🚌",
  contacts: "📞",
};

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function FAQChat() {
  const { language } = useApp();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    getFAQCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleAsk(question, category) {
    const userMsg = { role: "user", content: question, timestamp: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await askFAQ({ question, language, category });
      const botMsg = {
        role: "assistant",
        content: data.answer,
        timestamp: formatTime(),
        source: data.source,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Eish! Something went wrong. Please try again.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    handleAsk(trimmed, activeCategory);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  function handleSuggestionClick(question, categoryId) {
    handleAsk(question, categoryId);
  }

  // Get suggestions for active category
  const activeCatData = categories.find((c) => c.id === activeCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Category chips */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full font-jakarta text-xs font-medium transition-colors ${
              activeCategory === null
                ? "bg-teal-primary text-white dark:bg-teal-light"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full font-jakarta text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-teal-primary text-white dark:bg-teal-light"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {CATEGORY_EMOJI[cat.id] || "📄"} {cat.description.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="px-4 py-6">
            {/* Welcome */}
            <div className="text-center mb-6 animate-message-in">
              <span className="text-4xl mb-2 block">❓</span>
              <h2 className="font-jakarta font-bold text-xl text-teal-primary dark:text-white mb-1">
                School Information
              </h2>
              <p className="font-jakarta text-sm text-gray-500 dark:text-gray-400">
                Ask anything about Gudani Demo School or tap a question below
              </p>
            </div>

            {/* Suggestion questions */}
            {activeCatData ? (
              <div className="space-y-2 animate-message-in">
                <p className="text-xs font-jakarta font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
                  {activeCatData.description}
                </p>
                {activeCatData.questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q, activeCatData.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-jakarta text-sm text-gray-700 dark:text-gray-200 hover:border-teal-primary dark:hover:border-teal-light hover:shadow-sm transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-message-in">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-jakarta text-sm text-gray-700 dark:text-gray-200 hover:border-teal-primary dark:hover:border-teal-light hover:shadow-sm transition-all text-left"
                  >
                    <span className="text-xl">{CATEGORY_EMOJI[cat.id] || "📄"}</span>
                    <div>
                      <span className="font-medium block">{cat.description}</span>
                      <span className="text-xs text-gray-400">{cat.questions.length} questions</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={i}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1 animate-message-in`}
                >
                  <div className="max-w-[80%] sm:max-w-[70%]">
                    <div
                      className={`px-4 py-2.5 rounded-2xl font-jakarta text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-teal-primary text-white rounded-br-sm"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-2 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-jakarta">
                        {msg.timestamp}
                      </span>
                      {!isUser && msg.source && (
                        <span className="text-[10px] font-jakarta px-2 py-0.5 rounded-full bg-teal-primary/10 dark:bg-teal-light/20 text-teal-primary dark:text-teal-light">
                          {msg.source === "faq" ? "From FAQ" : msg.source === "llm" ? "AI answer" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Suggestion chips after bot response */}
            {!loading && activeCatData && messages.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 animate-message-in">
                {activeCatData.questions
                  .filter((q) => !messages.some((m) => m.role === "user" && m.content === q))
                  .slice(0, 3)
                  .map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(q, activeCatData.id)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-jakarta text-xs text-gray-600 dark:text-gray-300 hover:border-teal-primary dark:hover:border-teal-light transition-colors"
                    >
                      {q}
                    </button>
                  ))}
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 px-4 py-2 animate-message-in">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-teal-primary/60 dark:bg-teal-light/60 rounded-full animate-typing-dot" />
                  <span className="w-2 h-2 bg-teal-primary/60 dark:bg-teal-light/60 rounded-full animate-typing-dot [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-teal-primary/60 dark:bg-teal-light/60 rounded-full animate-typing-dot [animation-delay:0.4s]" />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta italic">
                  Looking that up...
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the school..."
          rows={1}
          disabled={loading}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm font-jakarta placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-teal-primary hover:bg-teal-light text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
