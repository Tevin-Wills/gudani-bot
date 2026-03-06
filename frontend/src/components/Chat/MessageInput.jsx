import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 md:relative"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={1}
        disabled={disabled}
        aria-label="Message input"
        className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm font-jakarta placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label="Send message"
        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-teal-primary hover:bg-teal-light text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {disabled ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        )}
      </button>
    </form>
  );
}
