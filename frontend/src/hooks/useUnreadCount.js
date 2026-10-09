import { useEffect, useState } from "react";
import { chatApi } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";

/**
 * Returns the number of conversations with unread messages.
 * Polls every 20s while the user is authenticated.
 * Returns 0 when unauthenticated.
 */
export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    let cancelled = false;

    const fetchCount = () => {
      chatApi
        .unreadCount()
        .then((r) => {
          if (!cancelled) setCount(r.unreadConversations ?? 0);
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return count;
}