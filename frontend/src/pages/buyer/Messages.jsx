import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { chatApi } from "../../api/chatApi";
import { useChat } from "../../context/ChatContext";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { refreshUnread } = useChat();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await chatApi.list({
        unread: filter === "unread",
        page: 0,
        size: 50,
      });
      const list = res.content || [];
      setConversations(list);

      // Auto-select first
      if (list.length > 0) {
        const requested = conversationId ? Number(conversationId) : null;
        const target = requested
          ? list.find((c) => c.id === requested) || list[0]
          : list[0];
        setActive(target);
      } else {
        setActive(null);
      }
    } catch {
      setConversations([]);
      setActive(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleSelect = (id) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setActive(conv);
      navigate(`/messages/${id}`, { replace: true });
      chatApi.markRead(id).then(() => refreshUnread()).catch(() => {});
    }
  };

  const handleBack = () => {
    setActive(null);
    navigate("/messages", { replace: true });
  };

  const handleNewMessage = () => {
    refreshUnread();
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* List — hidden on mobile when a chat is open */}
            <div
              className={`md:col-span-1 h-full ${
                active ? "hidden md:block" : "block"
              }`}
            >
              <ConversationList
                conversations={conversations}
                activeId={active?.id}
                onSelect={handleSelect}
                filter={filter}
                onFilterChange={setFilter}
                loading={loading}
              />
            </div>

            {/* Window — hidden on mobile when nothing selected */}
            <div
              className={`md:col-span-2 h-full ${
                active ? "block" : "hidden md:block"
              }`}
            >
              {active ? (
                <ChatWindow
                  conversation={active}
                  onBack={handleBack}
                  onMessageSent={handleNewMessage}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm bg-gray-50">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}