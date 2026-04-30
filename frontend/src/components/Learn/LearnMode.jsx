import { useEffect, useState } from "react";
import {
  getPhraseOfTheDay,
  getVocabulary,
  listLessons,
  getLesson,
  translateText,
  explainTerm,
  generatePractice,
} from "../../services/api";
import { speakText } from "../../hooks/useVoice";

const PANELS = [
  { id: "phrase", label: "Phrase of the day", emoji: "🌟" },
  { id: "vocab", label: "Vocabulary", emoji: "📖" },
  { id: "lessons", label: "Lessons", emoji: "🎓" },
  { id: "translate", label: "Translate", emoji: "🔁" },
  { id: "explain", label: "Explain", emoji: "💡" },
  { id: "practice", label: "Practice", emoji: "🎯" },
];

const LANGUAGE_OPTIONS = [
  { code: "ve", label: "Tshivenda (priority)" },
  { code: "zu", label: "isiZulu" },
  { code: "xh", label: "isiXhosa" },
  { code: "st", label: "Sesotho" },
  { code: "tn", label: "Setswana" },
  { code: "nso", label: "Sepedi" },
  { code: "ts", label: "Xitsonga" },
  { code: "af", label: "Afrikaans" },
];

function PhrasePanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    getPhraseOfTheDay().then(setData).catch((e) => setError(e.message));
  }, []);
  if (error) return <p className="text-amber-600 font-jakarta">{error}</p>;
  if (!data) return <p className="font-jakarta text-gray-400">Loading...</p>;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-jakarta uppercase tracking-wide text-teal-primary dark:text-teal-light mb-2">
        Tshivenda phrase of the day
      </p>
      <h3 className="font-jakarta font-bold text-2xl text-gray-800 dark:text-white mb-2">
        {data.ve}
      </h3>
      <p className="font-jakarta text-gray-600 dark:text-gray-300 mb-2">{data.en}</p>
      {data.note && <p className="font-jakarta text-xs text-gray-500 dark:text-gray-400">{data.note}</p>}
      <button
        onClick={() => speakText(data.ve, { language: "ve" })}
        className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-teal-primary text-teal-primary dark:text-teal-light dark:border-teal-light text-xs font-jakarta hover:bg-teal-primary hover:text-white transition-colors"
      >
        🔊 Listen
      </button>
    </div>
  );
}

function VocabPanel() {
  const [vocab, setVocab] = useState(null);
  const [active, setActive] = useState(null);
  useEffect(() => {
    getVocabulary().then((d) => {
      setVocab(d.categories || {});
      const first = Object.keys(d.categories || {})[0];
      if (first) setActive(first);
    }).catch(() => {});
  }, []);
  if (!vocab) return <p className="font-jakarta text-gray-400">Loading...</p>;
  const cats = Object.keys(vocab);
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-jakarta capitalize transition-colors ${
              active === c
                ? "bg-teal-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {c.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(vocab[active] || []).map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
          >
            <div>
              <p className="font-jakarta font-semibold text-gray-800 dark:text-white">{item.ve}</p>
              <p className="font-jakarta text-xs text-gray-500 dark:text-gray-400">{item.en}</p>
            </div>
            <button
              onClick={() => speakText(item.ve, { language: "ve" })}
              aria-label="Listen"
              className="text-teal-primary dark:text-teal-light"
            >
              🔊
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonsPanel() {
  const [lessons, setLessons] = useState([]);
  const [active, setActive] = useState(null);
  useEffect(() => {
    listLessons().then(setLessons).catch(() => {});
  }, []);
  function handleOpen(id) {
    getLesson(id).then(setActive).catch(() => {});
  }
  if (active) {
    return (
      <div>
        <button onClick={() => setActive(null)} className="mb-4 text-xs font-jakarta text-teal-primary dark:text-teal-light">
          ← Back to lessons
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-teal-primary dark:text-teal-light font-jakarta mb-1">
            {active.level}
          </p>
          <h3 className="font-jakarta font-bold text-xl text-gray-800 dark:text-white mb-2">{active.title}</h3>
          <p className="font-jakarta text-sm text-gray-600 dark:text-gray-300 mb-4">{active.summary}</p>
          <ul className="space-y-2 mb-4 list-disc list-inside font-jakarta text-sm text-gray-700 dark:text-gray-200">
            {active.content?.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
          {active.practice && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-xs font-jakarta font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                Practice
              </p>
              <ul className="space-y-1 font-jakarta text-sm text-gray-700 dark:text-gray-200">
                {active.practice.map((line, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {line}
                    <button onClick={() => speakText(line, { language: "ve" })} aria-label="Listen">🔊</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {lessons.map((l) => (
        <button
          key={l.id}
          onClick={() => handleOpen(l.id)}
          className="text-left bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-teal-primary dark:hover:border-teal-light transition-colors"
        >
          <p className="text-xs uppercase tracking-wide text-teal-primary dark:text-teal-light font-jakarta mb-1">
            {l.level}
          </p>
          <h3 className="font-jakarta font-semibold text-gray-800 dark:text-white mb-1">{l.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta">{l.summary}</p>
        </button>
      ))}
    </div>
  );
}

function TranslatePanel() {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("ve");
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  async function handleGo() {
    if (!text.trim()) return;
    setLoading(true);
    setErr(null);
    setOut(null);
    try {
      const res = await translateText({ text, source: "en", target });
      setOut(res.translation);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something in English..."
        rows={3}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm font-jakarta"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-jakarta"
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <button
          onClick={handleGo}
          disabled={loading || !text.trim()}
          className="px-4 py-2 rounded-lg bg-teal-primary text-white text-sm font-jakarta disabled:opacity-40"
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      </div>
      {err && <p className="text-xs font-jakarta text-amber-600">{err}</p>}
      {out && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap font-jakarta text-sm text-gray-800 dark:text-gray-100">
          {out}
          <button
            onClick={() => speakText(out, { language: target })}
            className="block mt-3 text-xs text-teal-primary dark:text-teal-light"
          >
            🔊 Listen
          </button>
        </div>
      )}
    </div>
  );
}

function ExplainPanel() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("ve");
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  async function handleGo() {
    if (!text.trim()) return;
    setLoading(true);
    setErr(null);
    setOut(null);
    try {
      const res = await explainTerm({ text, language, explain_in: "en" });
      setOut(res.explanation);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Word or phrase..."
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm font-jakarta"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-jakarta text-gray-500">in</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-jakarta"
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <button
          onClick={handleGo}
          disabled={loading || !text.trim()}
          className="px-4 py-2 rounded-lg bg-teal-primary text-white text-sm font-jakarta disabled:opacity-40"
        >
          {loading ? "Explaining..." : "Explain"}
        </button>
      </div>
      {err && <p className="text-xs font-jakarta text-amber-600">{err}</p>}
      {out && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap font-jakarta text-sm text-gray-800 dark:text-gray-100">
          {out}
        </div>
      )}
    </div>
  );
}

function PracticePanel() {
  const [items, setItems] = useState([]);
  const [reveal, setReveal] = useState({});
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("ve");
  async function fetchSet() {
    setLoading(true);
    setReveal({});
    try {
      const res = await generatePractice({ language, count: 5 });
      setItems(res.items || []);
    } catch (e) {
      setItems([]);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-jakarta"
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <button
          onClick={fetchSet}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-teal-primary text-white text-sm font-jakarta disabled:opacity-40"
        >
          {loading ? "Loading..." : "New set"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, i) => {
          const shown = reveal[i];
          return (
            <button
              key={i}
              onClick={() => setReveal((prev) => ({ ...prev, [i]: !prev[i] }))}
              className="text-left bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-teal-primary dark:hover:border-teal-light transition-colors"
            >
              <p className="font-jakarta font-semibold text-lg text-gray-800 dark:text-white">
                {item.ve}
              </p>
              <p
                className={`font-jakarta text-sm mt-1 ${
                  shown ? "text-gray-700 dark:text-gray-200" : "text-transparent select-none bg-gray-200 dark:bg-gray-700 rounded"
                }`}
              >
                {item.en || "—"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">tap to {shown ? "hide" : "reveal"}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LearnMode() {
  const [panel, setPanel] = useState("phrase");
  return (
    <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-jakarta font-bold text-2xl text-gray-800 dark:text-white">
              Learn a language
            </h2>
            <p className="font-jakarta text-sm text-gray-500 dark:text-gray-400">
              Tshivenda is the priority language. Other South African languages are best-effort.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {PANELS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPanel(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-jakarta transition-colors ${
                panel === p.id
                  ? "bg-teal-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              <span className="mr-1">{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>
        {panel === "phrase" && <PhrasePanel />}
        {panel === "vocab" && <VocabPanel />}
        {panel === "lessons" && <LessonsPanel />}
        {panel === "translate" && <TranslatePanel />}
        {panel === "explain" && <ExplainPanel />}
        {panel === "practice" && <PracticePanel />}
      </div>
    </div>
  );
}
