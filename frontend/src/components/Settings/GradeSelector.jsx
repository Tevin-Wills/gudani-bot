import { useApp } from "../../context/AppContext";
import { GRADES } from "../../utils/constants";

export default function GradeSelector() {
  const { grade, setGrade } = useApp();

  return (
    <div>
      <label htmlFor="grade-slider" className="block text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200 mb-3">
        Grade
      </label>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <input
            id="grade-slider"
            type="range"
            min={1}
            max={12}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            aria-label={`Grade ${grade}`}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-teal-primary dark:accent-teal-light"
          />
          <span className="w-20 text-center py-2 rounded-xl bg-teal-primary text-white dark:bg-teal-light font-jakarta font-bold text-sm">
            Grade {grade}
          </span>
        </div>
        <div className="flex justify-between px-1">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              aria-label={`Select grade ${g}`}
              className={`text-[10px] font-jakarta cursor-pointer bg-transparent border-none p-0 ${
                grade === g
                  ? "text-teal-primary dark:text-teal-light font-bold"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
