import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useSpeechRecognition } from "../../hooks/useVoice";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // mirrors backend cap

export default function MessageInput({ onSend, disabled, onImageSelected, attachedImage, onClearImage }) {
  const { language } = useApp();
  const [text, setText] = useState("");
  const [voiceError, setVoiceError] = useState(null);
  const fileInputRef = useRef(null);
  const { supported: voiceSupported, listening, interimText, start, stop, error } = useSpeechRecognition({
    language,
  });

  useEffect(() => {
    if (interimText) setText(interimText);
  }, [interimText]);

  useEffect(() => {
    if (error) setVoiceError(error);
  }, [error]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !attachedImage) || disabled) return;
    onSend(trimmed, attachedImage || null);
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setVoiceError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setVoiceError(`Image is too large. Max ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB.`);
      return;
    }
    setVoiceError(null);
    onImageSelected?.(file);
  }

  function toggleMic() {
    setVoiceError(null);
    if (listening) {
      stop();
      return;
    }
    start({
      onResult: (transcript) => {
        // Final transcript is reflected via interimText; nothing to do here.
        setText((prev) => (prev?.trim() ? prev : transcript));
      },
    });
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 md:relative">
      {attachedImage && (
        <div className="flex items-center gap-3 px-3 pt-3">
          <img
            src={URL.createObjectURL(attachedImage)}
            alt={attachedImage.name}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-jakarta text-gray-700 dark:text-gray-200 truncate">
              {attachedImage.name}
            </p>
            <p className="text-[10px] font-jakarta text-gray-400">
              {(attachedImage.size / 1024).toFixed(0)} KB · ready to send
            </p>
          </div>
          <button
            type="button"
            onClick={onClearImage}
            aria-label="Remove attached image"
            className="text-xs font-jakarta text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
      {voiceError && (
        <p className="px-4 pt-2 text-xs font-jakarta text-amber-600 dark:text-amber-400">
          {voiceError}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach an image"
          title="Attach an image"
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 hover:text-teal-primary hover:border-teal-primary dark:hover:text-teal-light dark:hover:border-teal-light transition-colors disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={toggleMic}
          disabled={disabled || !voiceSupported}
          aria-label={listening ? "Stop voice input" : "Start voice input"}
          title={voiceSupported ? "Voice input" : "Voice input not supported by this browser"}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-colors disabled:opacity-40 ${
            listening
              ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-900/20 animate-pulse"
              : "border-gray-300 dark:border-gray-600 text-gray-500 hover:text-teal-primary hover:border-teal-primary dark:hover:text-teal-light dark:hover:border-teal-light"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
            <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
          </svg>
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            attachedImage
              ? "Add a question about the image (optional)..."
              : listening
                ? "Listening..."
                : "Type your message, attach an image, or tap the mic..."
          }
          rows={1}
          disabled={disabled}
          aria-label="Message input"
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm font-jakarta placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={(!text.trim() && !attachedImage) || disabled}
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
    </div>
  );
}
