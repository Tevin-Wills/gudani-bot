import { useState, useCallback } from "react";
import { useApp } from "./context/AppContext";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import ChatWindow from "./components/Chat/ChatWindow";
import LanguageSelector from "./components/Settings/LanguageSelector";
import GradeSelector from "./components/Settings/GradeSelector";

function SettingsPanel() {
  const { darkMode, setDarkMode } = useApp();

  return (
    <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900 p-6 space-y-8">
      <h2 className="font-jakarta font-bold text-xl text-gray-800 dark:text-white">
        Settings
      </h2>
      <LanguageSelector />
      <GradeSelector />
      <div>
        <label className="block text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Appearance
        </label>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-jakarta text-sm transition-colors ${
            darkMode
              ? "border-teal-light bg-teal-light/10 text-teal-light"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          <span className="text-lg">{darkMode ? "\uD83C\uDF19" : "\u2600\uFE0F"}</span>
          <span>{darkMode ? "Dark mode" : "Light mode"}</span>
          <span className="ml-auto text-xs text-gray-400">
            Tap to switch
          </span>
        </button>
      </div>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-cream dark:bg-gray-900 px-6">
      <span className="text-5xl mb-4">{"\uD83D\uDEA7"}</span>
      <h2 className="font-jakarta font-bold text-xl text-gray-800 dark:text-white mb-2">
        {title}
      </h2>
      <p className="font-jakarta text-gray-500 dark:text-gray-400 text-sm">
        Coming soon! We're working hard to bring you this feature.
      </p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [clearKey, setClearKey] = useState(0);

  const handleClearChat = useCallback(() => {
    setClearKey((k) => k + 1);
  }, []);

  function renderContent() {
    switch (activeTab) {
      case "chat":
        return <ChatWindow clearKey={clearKey} />;
      case "settings":
        return <SettingsPanel />;
      case "quiz":
        return <ComingSoon title="Quiz" />;
      case "faq":
        return <ComingSoon title="School Info" />;
      case "notices":
        return <ComingSoon title="Notices" />;
      default:
        return <ChatWindow clearKey={clearKey} />;
    }
  }

  return (
    <div className="flex h-screen bg-cream dark:bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header activeTab={activeTab} onClearChat={handleClearChat} />
        {renderContent()}
      </main>
    </div>
  );
}
