import { useCallback, useEffect, useRef, useState } from "react";

// Mapping app language codes -> BCP-47 tags the browser SpeechRecognition / SpeechSynthesis APIs expect.
// For South African low-resource languages we deliberately fall back to the closest supported tag and
// surface the limitation honestly via `supported`.
const BCP47 = {
  en: "en-ZA",
  af: "af-ZA",
  zu: "zu-ZA",
  xh: "xh-ZA",
  st: "st-ZA",
  tn: "tn-ZA",
  nso: "nso-ZA",
  ts: "ts-ZA",
  ve: "ve-ZA",
};

export function getSpeechLang(code) {
  if (!code || code === "auto") return undefined;
  return BCP47[code] || "en-ZA";
}

// SpeechRecognition lives under either standard name or webkit prefix.
function getRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeechRecognition({ language } = {}) {
  const Recognition = getRecognitionCtor();
  const supported = !!Recognition;
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const finalRef = useRef("");

  const start = useCallback(
    ({ onResult } = {}) => {
      if (!Recognition) {
        setError("Voice input is not supported in this browser.");
        return;
      }
      try {
        const r = new Recognition();
        r.lang = getSpeechLang(language) || "en-ZA";
        r.interimResults = true;
        r.continuous = false;
        finalRef.current = "";
        r.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0]?.transcript || "";
            if (result.isFinal) {
              finalRef.current += transcript;
            } else {
              interim += transcript;
            }
          }
          setInterimText(finalRef.current + interim);
        };
        r.onerror = (event) => {
          // 'no-speech' is fine to ignore; the user can just try again.
          if (event.error && event.error !== "no-speech") {
            setError(event.error);
          }
        };
        r.onend = () => {
          setListening(false);
          const text = finalRef.current.trim();
          if (text && onResult) onResult(text);
          setInterimText("");
        };
        recognitionRef.current = r;
        r.start();
        setListening(true);
        setError(null);
      } catch (e) {
        setError(e.message || "Could not start voice input");
        setListening(false);
      }
    },
    [Recognition, language],
  );

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => () => {
    try {
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }
  }, []);

  return { supported, listening, interimText, error, start, stop };
}

export function speakText(text, { language } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return { ok: false, reason: "Speech output not supported in this browser." };
  }
  try {
    const utter = new SpeechSynthesisUtterance(text);
    const tag = getSpeechLang(language) || "en-ZA";
    utter.lang = tag;
    // Pick the best matching voice if available, else system default for the tag.
    const voices = window.speechSynthesis.getVoices() || [];
    const match =
      voices.find((v) => v.lang?.toLowerCase() === tag.toLowerCase()) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith(tag.split("-")[0].toLowerCase()));
    if (match) utter.voice = match;
    window.speechSynthesis.cancel(); // stop any in-progress utterance
    window.speechSynthesis.speak(utter);
    return { ok: true, voice: match?.name || "default" };
  } catch (e) {
    return { ok: false, reason: e.message || "TTS failed" };
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
