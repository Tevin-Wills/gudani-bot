import { useState } from "react";
import { generateAnnouncement } from "../../services/api";
import { LANGUAGES } from "../../utils/constants";

const TEMPLATES = [
  {
    label: "Fee reminder",
    emoji: "💰",
    text: "Reminder: School fees for this month are due by the 7th. Please ensure timely payment to avoid any disruption. Contact the school office if you need assistance with payment arrangements.",
  },
  {
    label: "Parent meeting",
    emoji: "👥",
    text: "Dear parents and guardians, you are invited to a parent-teacher meeting on Friday at 14:30 in the school hall. We will discuss learner progress and upcoming events. Your attendance is important.",
  },
  {
    label: "School closure",
    emoji: "🚨",
    text: "Important notice: The school will be closed tomorrow due to severe weather conditions. All learners must stay home. Classes will resume on the following school day. Stay safe.",
  },
  {
    label: "Exam timetable",
    emoji: "📝",
    text: "The end-of-term examination timetable has been released. Exams begin on Monday. Please ensure your child has all required stationery and arrives at school by 07:30. Study guides are available from class teachers.",
  },
];

const LANG_NAMES = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.native_name]));

export default function AnnouncementGenerator() {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("formal");
  const [translations, setTranslations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  async function handleGenerate() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setTranslations(null);

    try {
      const data = await generateAnnouncement({
        message,
        tone,
        source_language: "en",
      });
      setTranslations(data.translations);
    } catch (err) {
      setError(err.message || "Failed to generate translations. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(langCode) {
    if (!translations?.[langCode]) return;
    await navigator.clipboard.writeText(translations[langCode]);
    setCopied(langCode);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCopyAll() {
    if (!translations) return;
    const formatted = LANGUAGES.map(
      (l) => `--- ${l.native_name} (${l.code}) ---\n${translations[l.code] || ""}`
    ).join("\n\n");
    await navigator.clipboard.writeText(formatted);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-message-in">
          <span className="text-4xl mb-2 block">📢</span>
          <h2 className="font-jakarta font-bold text-xl text-teal-primary dark:text-white mb-1">
            Announcement Generator
          </h2>
          <p className="font-jakarta text-sm text-gray-500 dark:text-gray-400">
            Write once, translate to all 9 languages instantly
          </p>
        </div>

        {/* Template buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => setMessage(t.text)}
              className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-jakarta text-xs text-gray-600 dark:text-gray-300 hover:border-teal-primary dark:hover:border-teal-light transition-colors"
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your announcement here..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-jakarta text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary resize-none"
          />

          {/* Tone toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200">
              Tone:
            </span>
            <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setTone("formal")}
                className={`px-4 py-2 font-jakarta text-sm transition-colors ${
                  tone === "formal"
                    ? "bg-teal-primary text-white dark:bg-teal-light"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                Formal
              </button>
              <button
                onClick={() => setTone("casual")}
                className={`px-4 py-2 font-jakarta text-sm transition-colors ${
                  tone === "casual"
                    ? "bg-teal-primary text-white dark:bg-teal-light"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                Casual
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 font-jakarta">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!message.trim() || loading}
            className="w-full py-3.5 rounded-xl bg-amber-accent hover:bg-amber-500 text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-accent/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gudani is translating...
              </span>
            ) : (
              "Generate in all languages 🌍"
            )}
          </button>
        </div>

        {/* Results */}
        {translations && (
          <div className="animate-message-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-jakarta font-semibold text-sm text-gray-700 dark:text-gray-200">
                Translations
              </h3>
              <button
                onClick={handleCopyAll}
                className={`px-3 py-1.5 rounded-lg font-jakarta text-xs transition-colors ${
                  copied === "all"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {copied === "all" ? "Copied!" : "Copy All"}
              </button>
            </div>

            <div className="space-y-3">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-jakarta text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {lang.native_name}
                      <span className="text-gray-400 dark:text-gray-500 ml-1">({lang.code})</span>
                    </span>
                    <button
                      onClick={() => handleCopy(lang.code)}
                      className={`px-2.5 py-1 rounded-lg font-jakarta text-[11px] transition-colors ${
                        copied === lang.code
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {copied === lang.code ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="px-4 py-3 font-jakarta text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {translations[lang.code] || "Translation unavailable"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
