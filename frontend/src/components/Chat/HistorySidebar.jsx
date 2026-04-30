import { useEffect, useState } from "react";
import {
  listConversations,
  deleteConversation as apiDeleteConversation,
} from "../../services/api";

function formatRelative(ts) {
  if (!ts) return "";
  const ms = Date.now() - ts * 1000;
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function HistorySidebar({
  open,
  onClose,
  activeConversationId,
  onSelect,
  onNew,
  refreshKey,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listConversations()
      .then((data) => {
        if (!cancelled) setConversations(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, refreshKey]);

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await apiDeleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeConversationId) onNew?.();
    } catch (err) {
      alert(err.message || "Could not delete");
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        aria-hidden={!open}
        className={`fixed md:absolute top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-jakarta font-bold text-sm text-gray-800 dark:text-white">
            Past chats
          </h2>
          <button
            onClick={onClose}
            aria-label="Close history"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => {
            onNew?.();
            onClose?.();
          }}
          className="m-3 px-3 py-2 rounded-xl bg-teal-primary text-white text-sm font-jakarta hover:bg-teal-light transition-colors"
        >
          + New chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {loading && (
            <p className="px-3 py-4 text-xs font-jakarta text-gray-400">Loading...</p>
          )}
          {error && (
            <p className="px-3 py-4 text-xs font-jakarta text-amber-600">
              {error}
            </p>
          )}
          {!loading && !error && conversations.length === 0 && (
            <p className="px-3 py-4 text-xs font-jakarta text-gray-400">
              No saved chats yet. Start a conversation and it will appear here.
            </p>
          )}
          {conversations.map((c) => {
            const active = c.id === activeConversationId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onSelect?.(c.id);
                  onClose?.();
                }}
                className={`group w-full text-left px-3 py-2 rounded-lg mb-1 font-jakarta text-sm transition-colors ${
                  active
                    ? "bg-teal-primary/10 text-teal-primary dark:bg-teal-light/10 dark:text-teal-light"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate flex-1">{c.title || "Untitled"}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDelete(c.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleDelete(c.id, e);
                    }}
                    aria-label="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    Delete
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                  <span>{formatRelative(c.updated_at)}</span>
                  <span>·</span>
                  <span>{c.message_count || 0} msgs</span>
                  {c.language && <span className="uppercase">· {c.language}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
