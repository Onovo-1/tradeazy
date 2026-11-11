import { useCallback, useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { chatApi } from "../../api/chatApi";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("c") ? parseInt(searchParams.get("c"), 10) : null;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [tab, setTab] = useState("all"); 
  const [unreadOnly, setUnreadOnly] = useState(false);

  const lastLoadedId = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      if (conversations.length === 0) setLoading(true);
      
      let roleFilter = undefined;
      if (tab === "buyers") roleFilter = "SELLER";
      if (tab === "sellers") roleFilter = "BUYER";

      const res = await chatApi.listConversations({
        unread: unreadOnly,
        role: roleFilter,
        page: 0,
        size: 100,
      });
      setConversations(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [tab, unreadOnly, conversations.length]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) {
      setActiveConversation(null);
      lastLoadedId.current = null;
      return;
    }

    if (lastLoadedId.current === activeId) {
      return;
    }

    const found = conversations.find((c) => c.id === activeId);
    
    if (found) {
      setActiveConversation(found);
      lastLoadedId.current = activeId;
    } else {
      chatApi.getConversation(activeId)
        .then((data) => {
          setActiveConversation(data);
          lastLoadedId.current = activeId;
        })
        .catch(() => setError("Could not load that conversation."));
    }
  }, [activeId, conversations]); 

  const handleSelect = (id) => setSearchParams({ c: id });
  
  const handleRead = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
            <div className="flex border-b border-gray-200">
              {["all", "buyers", "sellers"].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSearchParams({}); }} 
                  className={`flex-1 py-2 text-sm font-medium transition capitalize ${
                    tab === t ? "text-maroon-700 border-b-2 border-maroon-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">Unread only</span>
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300 text-maroon-600 focus:ring-maroon-500"
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500">Loading…</div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  activeId={activeId}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 h-[calc(100vh-160px)] overflow-hidden">
            {error && (
              <div className="m-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {activeConversation ? (
              <ChatWindow
                conversationId={activeConversation.id}
                peer={{
                  id: activeConversation.peerId,
                  username: activeConversation.peerUsername,
                  firstName: activeConversation.peerFirstName,
                  lastName: activeConversation.peerLastName,
                }}
                product={{
                  id: activeConversation.productId,
                  name: activeConversation.productName,
                  // Ensure we pass the price correctly from the conversation object
                  price: activeConversation.productPrice || 0,
                }}
                role={activeConversation.role}
                onRead={handleRead}
                // The ChatWindow expects askingPrice, so we send it here
                askingPrice={activeConversation.productPrice || 0}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                {conversations.length ? "Pick a conversation to start chatting" : "No conversations match this filter"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}