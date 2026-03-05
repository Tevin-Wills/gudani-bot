export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-message-in">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-teal-primary/60 dark:bg-teal-light/60 rounded-full animate-typing-dot" />
        <span className="w-2 h-2 bg-teal-primary/60 dark:bg-teal-light/60 rounded-full animate-typing-dot [animation-delay:0.2s]" />
        <span className="w-2 h-2 bg-teal-primary/60 dark:bg-teal-light/60 rounded-full animate-typing-dot [animation-delay:0.4s]" />
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 font-jakarta italic">
        Gudani is thinking...
      </span>
    </div>
  );
}
