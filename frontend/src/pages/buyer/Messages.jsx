import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { chatApi } from "../../api/chatApi";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("c")
    ? parseInt(searchParams.get("c"), 10)
    : null;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // "all" | "unread"
  const [error, setError] = useState(null);

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const res = await chatApi.listConversations({
        unread: tab === "unread",
        page: 0,
        size: 100,
      });
      setConversations(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // If there's an active conversation, load its full details for the header
  const active = conversations.find((c) => c.id === activeId);

  const handleSelect = (id) => {
    setSearchParams({ c: id });
  };

  const handleRead = () => {
    // refresh list so the unread badge disappears
    loadConversations();
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          {/* Sidebar */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setTab("all")}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  tab === "all"
                    ? "text-maroon-700 border-b-2 border-maroon-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTab("unread")}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  tab === "unread"
                    ? "text-maroon-700 border-b-2 border-maroon-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Unread
              </button>
            </div>

            {loading ? (
              <div className="text-center py-6 text-sm text-gray-500">
                Loading…
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
              />
            )}
          </div>

          {/* Main panel */}
          <div>
            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {active ? (
              <ChatWindow
                conversationId={active.id}
                peer={{
                  id: active.peerId,
                  username: active.peerUsername,
                  firstName: active.peerFirstName,
                  lastName: active.peerLastName,
                }}
                product={{
                  id: active.productId,
                  name: active.productName,
                }}
                onRead={handleRead}
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 h-[calc(100vh-160px)] flex items-center justify-center text-gray-500 text-sm">
                {conversations.length
                  ? "Pick a conversation to start chatting"
                  : "No conversations yet"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}