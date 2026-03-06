import { useState, useEffect, useRef } from "react";

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export default function ScoreSummary({ summary, questions, answers, onTryAgain, onNewQuiz }) {
  const { total, correct, score_percent, recommendation } = summary;
  const displayPercent = useCountUp(score_percent);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (displayPercent / 100) * circumference;

  let ringColor, bgGlow, emoji, message;
  if (score_percent >= 80) {
    ringColor = "stroke-green-500";
    bgGlow = "text-green-500";
    emoji = "🌟";
    message = "Excellent! You really know your stuff!";
  } else if (score_percent >= 50) {
    ringColor = "stroke-amber-accent";
    bgGlow = "text-amber-accent";
    emoji = "💪";
    message = "Good effort! A bit more practice and you'll ace it!";
  } else {
    ringColor = "stroke-red-500";
    bgGlow = "text-red-500";
    emoji = "📚";
    message = "Don't worry — every expert was once a beginner! Keep learning!";
  }

  const wrongOnes = [];
  if (questions && answers) {
    questions.forEach((q) => {
      const a = answers[q.id];
      if (a && !a.correct) {
        wrongOnes.push({ question: q.question, correct_answer: a.correct_answer, your_answer: a.your_answer });
      }
    });
  }

  return (
    <div className="flex-1 overflow-y-auto bg-cream dark:bg-gray-900 px-4 sm:px-6 py-8">
      <div className="max-w-md mx-auto animate-message-in">
        {/* Score ring */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Score: ${score_percent}%`}>
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={ringColor}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-jakarta font-bold text-3xl ${bgGlow}`}>
                {displayPercent}%
              </span>
              <span className="font-jakarta text-xs text-gray-500 dark:text-gray-400">
                {correct}/{total}
              </span>
            </div>
          </div>

          <span className="text-3xl mb-2">{emoji}</span>
          <p className="font-jakarta font-bold text-lg text-gray-800 dark:text-white text-center">
            {message}
          </p>
          {recommendation && (
            <p className="font-jakarta text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-sm">
              {recommendation}
            </p>
          )}
        </div>

        {/* Wrong answers review */}
        {wrongOnes.length > 0 && (
          <div className="mb-8">
            <h3 className="font-jakarta font-semibold text-sm text-gray-700 dark:text-gray-200 mb-3">
              Review incorrect answers
            </h3>
            <div className="space-y-3">
              {wrongOnes.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10"
                >
                  <p className="font-jakarta text-sm text-gray-800 dark:text-gray-200 mb-1.5">
                    {item.question}
                  </p>
                  <div className="flex flex-col gap-1 text-xs font-jakarta">
                    <span className="text-red-500">
                      Your answer: {item.your_answer}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      Correct answer: {item.correct_answer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onTryAgain}
            aria-label="Try the same quiz again"
            className="flex-1 py-3.5 rounded-xl border border-teal-primary dark:border-teal-light text-teal-primary dark:text-teal-light font-jakarta font-semibold text-sm hover:bg-teal-primary/5 dark:hover:bg-teal-light/5 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onNewQuiz}
            aria-label="Start a new quiz"
            className="flex-1 py-3.5 rounded-xl bg-amber-accent hover:bg-amber-500 text-white font-jakarta font-semibold text-sm transition-colors shadow-lg shadow-amber-accent/25"
          >
            New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
