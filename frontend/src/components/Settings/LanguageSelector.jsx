import { useApp } from "../../context/AppContext";
import { LANGUAGES } from "../../utils/constants";

const OPTIONS = [
  { code: "auto", name: "Auto-detect", native_name: "Auto-detect" },
  ...LANGUAGES,
];

export default function LanguageSelector() {
  const { language, setLanguage } = useApp();

  return (
    <div>
      <label className="block text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200 mb-2">
        Language
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {OPTIONS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left font-jakarta text-sm transition-colors ${
              language === lang.code
                ? "border-teal-primary bg-teal-primary/10 dark:border-teal-light dark:bg-teal-light/10 text-teal-primary dark:text-teal-light"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <span className="font-semibold">{lang.native_name}</span>
            {lang.code !== "auto" && (
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                {lang.name}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
