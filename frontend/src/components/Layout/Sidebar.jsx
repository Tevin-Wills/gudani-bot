import { TABS } from "../../utils/constants";
import { useApp } from "../../context/AppContext";
import { LANGUAGES } from "../../utils/constants";

/**
 * Single sidebar that:
 *   - Acts as a slide-in drawer on mobile (< md), triggered by a hamburger in Header.
 *   - Acts as a sticky persistent panel on tablet & desktop (md+) with labels at every size.
 *
 * z-index ladder used across the app:
 *   60  drawer + drawer backdrop
 *   50  modal/wake overlays
 *   40  sticky header
 *   30  sticky chat input
 */
export default function Sidebar({
  activeTab,
  onTabChange,
  drawerOpen,
  onDrawerClose,
}) {
  const { language, setLanguage, darkMode, setDarkMode } = useApp();

  function handleTabClick(id) {
    onTabChange(id);
    onDrawerClose?.();
  }

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onDrawerClose}
        className={`md:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        aria-label="Main navigation"
        className={`fixed md:sticky top-0 left-0 h-screen w-72 md:w-60 lg:w-64 shrink-0 z-[60]
          bg-teal-primary dark:bg-charcoal text-white flex flex-col
          transition-transform duration-200 ease-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img
            src="/gudani-icon.svg"
            alt=""
            className="w-9 h-9 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-jakarta font-bold text-lg leading-tight truncate">
              Gudani
            </p>
            <p className="font-jakarta text-[11px] leading-tight text-white/70 truncate">
              Community assistant
            </p>
          </div>
          {/* Mobile close */}
          <button
            type="button"
            onClick={onDrawerClose}
            aria-label="Close menu"
            className="md:hidden ml-auto p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3" aria-label="Sections">
          <ul className="px-2 space-y-1">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    aria-current={active ? "page" : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                      font-jakarta text-sm transition-colors
                      ${active
                        ? "bg-white text-teal-primary dark:bg-teal-light dark:text-charcoal font-semibold"
                        : "text-white/85 hover:bg-white/10"}`}
                  >
                    <span className="text-xl shrink-0" aria-hidden="true">{tab.emoji}</span>
                    <span className="truncate">{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer controls — language + dark mode */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <label className="block px-1 text-[11px] font-jakarta uppercase tracking-wide text-white/60">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select language"
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm font-jakarta text-white focus:outline-none focus:ring-2 focus:ring-amber-accent"
          >
            <option value="auto" className="text-gray-900">Auto-detect</option>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="text-gray-900">
                {lang.native_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-jakarta text-white"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{darkMode ? "🌙" : "☀️"}</span>
              <span>{darkMode ? "Dark" : "Light"} mode</span>
            </span>
            <span className="text-[11px] text-white/60">tap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
