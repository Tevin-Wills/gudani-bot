import { useApp } from "../../context/AppContext";
import { LANGUAGES } from "../../utils/constants";

export default function Header({ activeTab, onClearChat }) {
  const { language, setLanguage } = useApp();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <img
          src="/gudani-icon.svg"
          alt="Gudani"
          className="w-8 h-8 md:hidden"
        />
        <div>
          <h1 className="font-jakarta font-bold text-teal-primary dark:text-white text-lg leading-tight">
            Gudani Bot
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta">
            Learn in your language
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {activeTab === "chat" && onClearChat && (
          <button
            onClick={onClearChat}
            title="Clear chat"
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-jakarta focus:outline-none focus:ring-2 focus:ring-teal-primary"
        >
          <option value="auto">Auto-detect</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native_name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
