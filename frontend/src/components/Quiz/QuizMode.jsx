import { useState, useCallback } from "react";
import { startQuiz, submitAnswer, getQuizSummary } from "../../services/api";
import QuizSetup from "./QuizSetup";
import QuestionCard from "./QuestionCard";
import ScoreSummary from "./ScoreSummary";

export default function QuizMode() {
  const [phase, setPhase] = useState("setup"); // setup | in-progress | complete
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
  const [summary, setSummary] = useState(null);
  const [lastConfig, setLastConfig] = useState(null);

  const handleStart = useCallback(async (config) => {
    setLastConfig(config);
    const data = await startQuiz(config);
    setQuizId(data.quiz_id);
    setQuestions(data.questions);
    setCurrentIndex(0);
    setAnswers({});
    setFeedback(null);
    setSummary(null);
    setPhase("in-progress");
  }, []);

  async function handleAnswer(answer) {
    const question = questions[currentIndex];
    setChecking(true);
    setFeedback(null);

    try {
      const result = await submitAnswer({
        quiz_id: quizId,
        question_id: question.id,
        answer,
      });

      setFeedback(result);
      setAnswers((prev) => ({
        ...prev,
        [question.id]: {
          your_answer: answer,
          correct: result.correct,
          correct_answer: result.correct_answer,
          explanation: result.explanation,
        },
      }));
    } catch {
      setFeedback({
        correct: false,
        correct_answer: "?",
        explanation: "Eish! Could not check your answer. Try the next question.",
      });
    } finally {
      setChecking(false);
    }
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
    } else {
      // Quiz complete — fetch summary
      try {
        const data = await getQuizSummary(quizId);
        setSummary(data);
      } catch {
        // Build local summary if API fails
        const correctCount = Object.values(answers).filter((a) => a.correct).length;
        setSummary({
          total: questions.length,
          correct: correctCount,
          score_percent: Math.round((correctCount / questions.length) * 100),
          weak_areas: [],
          recommendation: "",
        });
      }
      setPhase("complete");
    }
  }

  function handleTryAgain() {
    if (lastConfig) {
      handleStart(lastConfig).catch(() => setPhase("setup"));
    } else {
      setPhase("setup");
    }
  }

  function handleNewQuiz() {
    setPhase("setup");
    setQuizId(null);
    setQuestions([]);
    setAnswers({});
    setFeedback(null);
    setSummary(null);
  }

  if (phase === "setup") {
    return <QuizSetup onStart={handleStart} />;
  }

  if (phase === "complete" && summary) {
    return (
      <ScoreSummary
        summary={summary}
        questions={questions}
        answers={answers}
        onTryAgain={handleTryAgain}
        onNewQuiz={handleNewQuiz}
      />
    );
  }

  // in-progress
  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="flex flex-col h-full">
      <QuestionCard
        key={question.id}
        question={question}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        feedback={feedback}
        loading={checking}
      />
      {/* Next button fixed at bottom */}
      {feedback && (
        <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 animate-message-in">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-teal-primary hover:bg-teal-light dark:bg-teal-light dark:hover:bg-teal-primary text-white font-jakarta font-semibold text-sm transition-colors"
          >
            {currentIndex < questions.length - 1 ? "Next Question →" : "See Results 🏆"}
          </button>
        </div>
      )}
    </div>
  );
}
