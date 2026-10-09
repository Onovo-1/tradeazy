import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../hooks/useChat";
import { chatApi } from "../../api/chatApi";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWindow({ conversationId, peer, product, onRead }) {
  const { user } = useAuth();
  const { messages, loading, sending, send } = useChat(conversationId);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  // mark read on open + whenever new messages arrive
  useEffect(() => {
    if (!conversationId) return;
    chatApi.markRead(conversationId).then(() => {
      onRead?.();
    }).catch(() => {});
  }, [conversationId, messages.length, onRead]);

  // auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await send(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold">
          {peer?.firstName?.[0]?.toUpperCase() ||
            peer?.username?.[0]?.toUpperCase() ||
            "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">
            {peer?.firstName} {peer?.lastName}
          </div>
          <div className="text-xs text-gray-500 truncate">
            @{peer?.username}
          </div>
        </div>
        {product && (
          <Link
            to={`/products/${product.id}`}
            className="text-xs text-maroon-700 hover:underline shrink-0"
          >
            about {product.name} →
          </Link>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gray-50 px-4 py-3 space-y-3"
      >
        {loading ? (
          <div className="text-center text-sm text-gray-500 py-6">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-6">
            No messages yet. Say hi 👋
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    mine
                      ? "bg-maroon-700 text-white rounded-br-sm"
                      : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <div
                    className={`text-[10px] mt-1 ${
                      mine ? "text-maroon-200" : "text-gray-400"
                    } text-right`}
                  >
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 px-3 py-2 flex gap-2 bg-white"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          disabled={sending}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-semibold px-4 rounded-lg transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}