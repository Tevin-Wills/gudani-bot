import { TABS } from "../../utils/constants";

const TAB_TITLES = {
  chat: { title: "Chat", subtitle: "Ask anything · 9 languages · image · voice" },
  learn: { title: "Learn", subtitle: "Tshivenda + South African languages" },
  quiz: { title: "Practice & Quiz", subtitle: "Mixed CAPS-aligned questions" },
  faq: { title: "Community & School Info", subtitle: "Quick answers about your area" },
  notices: { title: "Notices & Messages", subtitle: "Translate to all 9 languages" },
  settings: { title: "Settings", subtitle: "Language, grade, appearance" },
};

/**
 * Sticky top header. On mobile shows a hamburger that opens the drawer.
 * On the chat tab it also exposes Past chats / New chat actions so they
 * don't crowd the chat body.
 */
export default function Header({
  activeTab,
  onOpenDrawer,
  onOpenHistory,
  onNewChat,
}) {
  const tab = TAB_TITLES[activeTab] || TAB_TITLES.chat;
  const showChatActions = activeTab === "chat";

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3">
        {/* Hamburger (mobile only) */}
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          className="md:hidden shrink-0 p-2 -ml-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M2 5.75A.75.75 0 0 1 2.75 5h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 5.75Zm0 4.5A.75.75 0 0 1 2.75 9.5h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm.75 3.75a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75Z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Title block (truncates on small screens) */}
        <div className="min-w-0 flex-1">
          <h1 className="font-jakarta font-bold text-base sm:text-lg leading-tight text-teal-primary dark:text-white truncate">
            {tab.title}
          </h1>
          <p className="font-jakarta text-[11px] sm:text-xs leading-tight text-gray-500 dark:text-gray-400 truncate">
            {tab.subtitle}
          </p>
        </div>

        {/* Chat actions */}
        {showChatActions && (
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenHistory}
              aria-label="Show past chats"
              title="Past chats"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-jakarta text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 1 0 1.06-1.06l-2.78-2.78V5Z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Past chats</span>
            </button>
            <button
              type="button"
              onClick={onNewChat}
              aria-label="Start a new chat"
              title="New chat"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-jakarta text-white bg-teal-primary hover:bg-teal-light transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
