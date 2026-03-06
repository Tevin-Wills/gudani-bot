import { TABS } from "../../utils/constants";

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-56 bg-teal-primary dark:bg-charcoal border-r border-teal-dark dark:border-gray-700 h-screen sticky top-0 shrink-0">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-teal-light dark:border-gray-700">
          <img src="/gudani-icon.svg" alt="Gudani" className="w-10 h-10" />
          <span className="hidden lg:block text-white font-jakarta font-bold text-lg">
            Gudani
          </span>
        </div>
        <nav className="flex-1 py-4 space-y-1" aria-label="Main navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-jakarta transition-colors ${
                activeTab === tab.id
                  ? "bg-teal-light dark:bg-gray-700 text-amber-accent"
                  : "text-gray-200 hover:bg-teal-light/50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className="hidden lg:block">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-teal-primary dark:bg-charcoal border-t border-teal-dark dark:border-gray-700 z-50 flex"
        aria-label="Main navigation"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={`flex-1 flex flex-col items-center py-2 text-[10px] font-jakarta transition-colors ${
              activeTab === tab.id
                ? "text-amber-accent"
                : "text-gray-300"
            }`}
          >
            <span className="text-xl mb-0.5">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
