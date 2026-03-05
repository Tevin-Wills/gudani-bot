export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const LANGUAGES = [
  { code: "en", name: "English", native_name: "English" },
  { code: "af", name: "Afrikaans", native_name: "Afrikaans" },
  { code: "zu", name: "Zulu", native_name: "isiZulu" },
  { code: "xh", name: "Xhosa", native_name: "isiXhosa" },
  { code: "st", name: "Sotho", native_name: "Sesotho" },
  { code: "tn", name: "Tswana", native_name: "Setswana" },
  { code: "nso", name: "Northern Sotho", native_name: "Sepedi" },
  { code: "ts", name: "Tsonga", native_name: "Xitsonga" },
  { code: "ve", name: "Venda", native_name: "Tshivenda" },
];

export const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export const TABS = [
  { id: "chat", label: "Chat", emoji: "\uD83D\uDCAC" },
  { id: "quiz", label: "Quiz", emoji: "\uD83D\uDCDD" },
  { id: "faq", label: "School Info", emoji: "\u2753" },
  { id: "notices", label: "Notices", emoji: "\uD83D\uDCE2" },
  { id: "settings", label: "Settings", emoji: "\u2699\uFE0F" },
];
