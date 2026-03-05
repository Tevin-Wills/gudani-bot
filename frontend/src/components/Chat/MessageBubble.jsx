import LanguageBadge from "./LanguageBadge";

const EXPLAIN_SIMPLER = {
  en: "Please explain that more simply",
  af: "Verduidelik dit asseblief eenvoudiger",
  zu: "Ngicela uchaze lokho kalula",
  xh: "Nceda ucacise oko lula",
  st: "Ka kopo hlalosa seo ka tsela e bonolo",
  tn: "Tlhalosa seo ka tsela e e bonolo",
  nso: "Hle hlaloša seo ka tsela e bonolo",
  ts: "Ndzi kombela u hlamusela sweswo hi ndlela yo olova",
  ve: "Ndi humbela u amba zwenezwo nga ndila yo leluwa",
};

export default function MessageBubble({ message, onExplainSimpler }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1 animate-message-in`}>
      <div className={`max-w-[80%] sm:max-w-[70%]`}>
        <div
          className={`px-4 py-2.5 rounded-2xl font-jakarta text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-teal-primary text-white rounded-br-sm"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-jakarta">
            {message.timestamp}
          </span>
          {message.detected_language && (
            <LanguageBadge
              code={message.detected_language}
              translated={message.translated}
            />
          )}
        </div>
        {!isUser && onExplainSimpler && (
          <button
            onClick={() => {
              const lang = message.detected_language || "en";
              onExplainSimpler(EXPLAIN_SIMPLER[lang] || EXPLAIN_SIMPLER.en);
            }}
            className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-jakarta text-gray-500 dark:text-gray-400 hover:border-teal-primary hover:text-teal-primary dark:hover:border-teal-light dark:hover:text-teal-light transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            Explain simpler
          </button>
        )}
      </div>
    </div>
  );
}
