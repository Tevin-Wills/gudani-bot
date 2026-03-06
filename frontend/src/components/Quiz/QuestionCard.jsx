import { useState } from "react";

export default function QuestionCard({
  question,
  totalQuestions,
  onAnswer,
  feedback,
  loading,
}) {
  const [selected, setSelected] = useState(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const answered = feedback !== null;

  const progress = (question.id / totalQuestions) * 100;

  function handleSelect(option) {
    if (answered || loading) return;
    setSelected(option);
    onAnswer(option);
  }

  function handleFillSubmit(e) {
    e.preventDefault();
    if (!fillAnswer.trim() || answered || loading) return;
    setSelected(fillAnswer.trim());
    onAnswer(fillAnswer.trim());
  }

  function getOptionStyle(option) {
    if (!answered) {
      return selected === option
        ? "border-teal-primary bg-teal-primary/10 dark:border-teal-light dark:bg-teal-light/10"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600";
    }
    const isCorrect = option === feedback.correct_answer ||
      option.startsWith(feedback.correct_answer + ")") ||
      option.startsWith(feedback.correct_answer + " ");
    const isSelected = option === selected;

    if (isCorrect) return "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400";
    if (isSelected && !feedback.correct) return "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400";
    return "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50";
  }

  return (
    <div className="flex-1 flex flex-col bg-cream dark:bg-gray-900 overflow-y-auto">
      {/* Progress bar */}
      <div className="px-4 sm:px-6 pt-5 pb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-jakarta font-semibold text-gray-600 dark:text-gray-300">
            Question {question.id} of {totalQuestions}
          </span>
          <span className="text-xs font-jakarta text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
            {question.type === "mcq" ? "Multiple Choice" : question.type === "true_false" ? "True / False" : "Fill in the Blank"}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-teal-primary dark:bg-teal-light rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-4 sm:px-6 py-4 animate-slide-in">
        <h3 className="font-jakarta font-bold text-lg text-gray-800 dark:text-white leading-relaxed mb-6">
          {question.question}
        </h3>

        {/* MCQ or True/False options */}
        {(question.type === "mcq" || question.type === "true_false") && (
          <div className={`${question.type === "true_false" ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={answered || loading}
                aria-label={`Option: ${option}`}
                className={`w-full text-left px-4 py-3.5 rounded-xl border font-jakarta text-sm transition-all disabled:cursor-default ${getOptionStyle(option)}`}
              >
                <span className="text-gray-800 dark:text-gray-100">{option}</span>
              </button>
            ))}
          </div>
        )}

        {/* Fill in blank */}
        {question.type === "fill_blank" && (
          <form onSubmit={handleFillSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={fillAnswer}
              onChange={(e) => setFillAnswer(e.target.value)}
              disabled={answered || loading}
              placeholder="Type your answer..."
              aria-label="Your answer"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-jakarta text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary disabled:opacity-60"
            />
            {!answered && (
              <button
                type="submit"
                disabled={!fillAnswer.trim() || loading}
                aria-label="Submit answer"
                className="px-6 py-3 rounded-xl bg-teal-primary hover:bg-teal-light text-white font-jakarta font-semibold text-sm transition-colors disabled:opacity-40"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </form>
        )}

        {/* Loading spinner */}
        {loading && question.type !== "fill_blank" && (
          <div className="flex items-center gap-2 mt-4 animate-message-in">
            <span className="w-4 h-4 border-2 border-teal-primary/30 border-t-teal-primary rounded-full animate-spin" />
            <span className="text-sm font-jakarta text-gray-500 dark:text-gray-400">Checking your answer...</span>
          </div>
        )}

        {/* Feedback */}
        {answered && feedback && (
          <div
            className={`mt-5 p-4 rounded-xl animate-message-in ${
              feedback.correct
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
            role="alert"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{feedback.correct ? "✅" : "❌"}</span>
              <span className={`font-jakarta font-bold text-sm ${
                feedback.correct ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
              }`}>
                {feedback.correct ? "Correct!" : "Incorrect"}
              </span>
            </div>
            <p className="font-jakarta text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {feedback.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
