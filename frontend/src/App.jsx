import { useState, useCallback, useEffect, useRef } from "react";
import { useApp } from "./context/AppContext";
import { healthCheck, ping } from "./services/api";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import ChatWindow from "./components/Chat/ChatWindow";
import QuizMode from "./components/Quiz/QuizMode";
import FAQChat from "./components/FAQ/FAQChat";
import AnnouncementGenerator from "./components/Announcements/AnnouncementGenerator";
import LanguageSelector from "./components/Settings/LanguageSelector";
import GradeSelector from "./components/Settings/GradeSelector";

const PING_INTERVAL = 13 * 60 * 1000;
const WAKE_DELAY = 3000;

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

function WakeUpOverlay({ fadingOut }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream dark:bg-gray-900 ${
        fadingOut ? "animate-fade-out" : ""
      }`}
    >
      <div className="animate-gentle-pulse mb-6">
        <div className="w-20 h-20 rounded-2xl bg-teal dark:bg-teal-light flex items-center justify-center shadow-lg">
          <span className="text-4xl text-white font-jakarta font-bold">G</span>
        </div>
      </div>
      <h2 className="font-jakarta font-bold text-xl text-gray-800 dark:text-white mb-2">
        Gudani is waking up...
      </h2>
      <p className="font-jakarta text-gray-500 dark:text-gray-400 text-sm mb-6">
        This might take a moment
      </p>
      <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-teal dark:bg-teal-light rounded-full animate-shimmer" />
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
  const [waking, setWaking] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const showOverlay = useRef(false);

  const handleClearChat = useCallback(() => {
    setClearKey((k) => k + 1);
  }, []);

  // Wake-up health check
  useEffect(() => {
    const timer = setTimeout(() => {
      showOverlay.current = true;
    }, WAKE_DELAY);

    healthCheck()
      .then(() => console.log("[gudani] backend is awake"))
      .catch((err) => console.warn("[gudani] health check failed:", err))
      .finally(() => {
        clearTimeout(timer);
        if (showOverlay.current) {
          setFadingOut(true);
          setTimeout(() => setWaking(false), 500);
        } else {
          setWaking(false);
        }
      });

    return () => clearTimeout(timer);
  }, []);

  // Keep-alive ping every 13 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      ping()
        .then((res) => console.log("[gudani] ping:", res))
        .catch((err) => console.warn("[gudani] ping failed:", err));
    }, PING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  function renderContent() {
    switch (activeTab) {
      case "chat":
        return <ChatWindow clearKey={clearKey} />;
      case "settings":
        return <SettingsPanel />;
      case "quiz":
        return <QuizMode />;
      case "faq":
        return <FAQChat />;
      case "notices":
        return <AnnouncementGenerator />;
      default:
        return <ChatWindow clearKey={clearKey} />;
    }
  }

  return (
    <div className="flex h-screen bg-cream dark:bg-gray-900">
      {waking && <WakeUpOverlay fadingOut={fadingOut} />}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header activeTab={activeTab} onClearChat={handleClearChat} />
        {renderContent()}
      </main>
    </div>
  );
}
