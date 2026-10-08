import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { chatApi } from "../api/chatApi";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await chatApi.unreadCount();
      setUnreadCount(res.unreadConversations ?? 0);
    } catch {
      // silently ignore
    }
  }, [isAuthenticated]);

  // Poll unread count every 15 seconds
  useEffect(() => {
    refreshUnread();
    if (!isAuthenticated) return;

    const interval = setInterval(refreshUnread, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnread]);

  const value = {
    unreadCount,
    refreshUnread,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}