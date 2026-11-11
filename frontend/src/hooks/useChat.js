import { useState, useEffect, useCallback } from "react";
import { chatApi } from "../api/chatApi";

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const res = await chatApi.listMessages(conversationId, { page: 0, size: 100 });
      setMessages(res.content || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const send = async (text) => {
    setSending(true);
    try {
      const sent = await chatApi.sendMessage(conversationId, text);
      setMessages((prev) => [...prev, sent]);
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, send, refresh: fetchMessages };
}