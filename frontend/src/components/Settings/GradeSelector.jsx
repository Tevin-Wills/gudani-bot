import { useApp } from "../../context/AppContext";
import { GRADES } from "../../utils/constants";

export default function GradeSelector() {
  const { grade, setGrade } = useApp();

  return (
    <div>
      <label className="block text-sm font-jakarta font-semibold text-gray-700 dark:text-gray-200 mb-3">
        Grade
      </label>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={12}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-teal-primary dark:accent-teal-light"
          />
          <span className="w-20 text-center py-2 rounded-xl bg-teal-primary text-white dark:bg-teal-light font-jakarta font-bold text-sm">
            Grade {grade}
          </span>
        </div>
        <div className="flex justify-between px-1">
          {GRADES.map((g) => (
            <span
              key={g}
              className={`text-[10px] font-jakarta cursor-pointer ${
                grade === g
                  ? "text-teal-primary dark:text-teal-light font-bold"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              onClick={() => setGrade(g)}
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
