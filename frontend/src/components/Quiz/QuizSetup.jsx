import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { getSubjects } from "../../services/api";

const QUESTION_COUNTS = [5, 10, 15, 20];

function SkeletonSetup() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-cream dark:bg-gray-900">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center mb-8">
          <div className="skeleton w-16 h-16 mx-auto mb-3 rounded-2xl" />
          <div className="skeleton h-7 w-40 mx-auto mb-2" />
          <div className="skeleton h-4 w-56 mx-auto" />
        </div>
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-full" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton h-10 flex-1" />
          ))}
        </div>
        <div className="skeleton h-14 w-full" />
      </div>
    </div>
  );
}

export default function QuizSetup({ onStart }) {
  const { grade, language } = useApp();
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingSubjects(true);
    getSubjects()
      .then((data) => {
        setSubjects(data);
        if (data.length > 0) setSubject(data[0]);
      })
      .catch(() => {
        setSubjects(["Mathematics", "Physical Sciences", "Life Sciences", "Geography", "History"]);
        setSubject("Mathematics");
      })
      .finally(() => setLoadingSubjects(false));
  }, []);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      await onStart({ subject, topic, grade, language, num_questions: numQuestions });
    } catch (err) {
      setError(err.message || "Failed to start quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingSubjects) return <SkeletonSetup />;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-cream dark:bg-gray-900 overflow-y-auto">
      <div className="w-full max-w-md animate-message-in">
        {/* Empty state hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-accent/10 flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h2 className="font-jakarta font-bold text-2xl text-teal-primary dark:text-white mb-2">
            Quiz Mode
          </h2>
          <p className="font-jakarta text-gray-500 dark:text-gray-400">
            Test your knowledge — pick a subject and go!
          </p>
        </div>

        <div className="space-y-5">
          {/* Subject */}
          <div>
            <label htmlFor="quiz-subject" className="block text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              Subject
            </label>
            <select
              id="quiz-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-jakarta text-sm focus:outline-none focus:ring-2 focus:ring-teal-primary"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label htmlFor="quiz-topic" className="block text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              Topic <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="quiz-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Leave blank for general quiz"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-jakarta text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary"
            />
          </div>

          {/* Number of Questions */}
          <div>
            <span className="block text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              Number of questions
            </span>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  aria-label={`${n} questions`}
                  aria-pressed={numQuestions === n}
                  className={`flex-1 py-2.5 rounded-xl border font-jakarta text-sm font-semibold transition-colors ${
                    numQuestions === n
                      ? "border-teal-primary bg-teal-primary text-white dark:border-teal-light dark:bg-teal-light"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-teal-primary/5 dark:bg-teal-light/5 border border-teal-primary/10 dark:border-teal-light/10">
            <span className="text-sm">📋</span>
            <span className="text-xs font-jakarta text-gray-600 dark:text-gray-400">
              Grade {grade} · {language === "auto" ? "Auto-detect" : language.toUpperCase()} · Mixed question types
            </span>
          </div>

          {error && (
            <p className="text-sm text-red-500 font-jakarta text-center" role="alert">{error}</p>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={loading || !subject}
            aria-label="Start quiz"
            className="w-full py-4 rounded-xl bg-amber-accent hover:bg-amber-500 text-white font-jakarta font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-accent/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating quiz...
              </span>
            ) : (
              "Start Quiz"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
