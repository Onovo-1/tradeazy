import { useEffect, useRef, useState } from "react";
import { chatApi } from "../../api/chatApi";
import { useAuth } from "../../context/AuthContext";
import { formatRelativeTime } from "../../utils/formatters";

export default function ChatWindow({ conversation, onBack, onMessageSent }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await chatApi.messages(conversation.id, { page: 0, size: 200 });
      setMessages(res.content || []);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setContent("");
    setError(null);
    loadMessages();
    // Mark read
    chatApi.markRead(conversation.id).then(() => {
      if (onMessageSent) onMessageSent();
    }).catch(() => {});

    // Poll every 5s for new messages
    pollRef.current = setInterval(() => loadMessages(true), 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    try {
      const msg = await chatApi.send(conversation.id, text);
      setMessages((prev) => [...prev, msg]);
      setContent("");
      if (onMessageSent) onMessageSent();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const peerName =
    [conversation.peerFirstName, conversation.peerLastName]
      .filter(Boolean)
      .join(" ") || conversation.peerUsername;

  const initial = peerName[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden text-gray-600 hover:text-gray-900 text-xl"
          aria-label="Back"
        >
          ←
        </button>
        <div className="w-10 h-10 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{peerName}</p>
          <p className="text-xs text-maroon-700 truncate">
            About: {conversation.productName}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-gray-500 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === user?.id;
            return (
              <div
                key={m.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                    isMine
                      ? "bg-maroon-700 text-white rounded-br-sm"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? "text-maroon-200" : "text-gray-400"
                    }`}
                  >
                    {formatRelativeTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-4 mb-2 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-gray-200 p-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          maxLength={2000}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-maroon-700 hover:bg-maroon-800 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}