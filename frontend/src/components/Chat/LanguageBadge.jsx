import { LANGUAGES } from "../../utils/constants";

export default function LanguageBadge({ code, translated }) {
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-jakarta px-2 py-0.5 rounded-full bg-teal-primary/10 dark:bg-teal-light/20 text-teal-primary dark:text-teal-light">
      {lang.native_name}
      {translated && (
        <span className="text-amber-accent" title="Translated">
          *
        </span>
      )}
    </span>
  );
}
