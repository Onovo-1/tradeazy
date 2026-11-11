import { useEffect, useState } from "react";
import { chatApi } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";

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
          if (!cancelled) {
            // Log to verify the response structure
            console.log("Unread count response:", r); 
            setCount(r.unreadConversations ?? 0);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch unread count:", err.response?.data || err.message);
        });
    };

    fetchCount();
    const interval = setInterval(fetchCount, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return { count };
}