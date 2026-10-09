import { useCallback, useEffect, useState } from "react";
import { chatApi } from "../api/chatApi";

/**
 * Loads a conversation's messages + polls for new ones every 4 seconds.
 * Sends messages optimistically.
 */
export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await chatApi.listMessages(conversationId, { page: 0, size: 200 });
      setMessages(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();

    // poll for new messages
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [conversationId, fetchMessages]);

  const send = async (content) => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const created = await chatApi.sendMessage(conversationId, content.trim());
      setMessages((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, error, send, refresh: fetchMessages };
}