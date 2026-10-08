import axiosClient from "./axiosClient";

export const chatApi = {
  // Start (or fetch existing) conversation about a product
  start: (productId) =>
    axiosClient
      .post("/conversations", { productId })
      .then((r) => r.data),

  // List conversations (unread filter optional)
  list: ({ unread = false, page = 0, size = 50 } = {}) =>
    axiosClient
      .get("/conversations", { params: { unread, page, size } })
      .then((r) => r.data),

  // Single conversation
  get: (id) =>
    axiosClient.get(`/conversations/${id}`).then((r) => r.data),

  // Mark all messages in a conversation as read
  markRead: (id) =>
    axiosClient.patch(`/conversations/${id}/read`).then((r) => r.data),

  // Navbar badge
  unreadCount: () =>
    axiosClient.get("/conversations/unread-count").then((r) => r.data),

  // Messages in a conversation
  messages: (conversationId, { page = 0, size = 100 } = {}) =>
    axiosClient
      .get(`/conversations/${conversationId}/messages`, {
        params: { page, size },
      })
      .then((r) => r.data),

  // Send a message
  send: (conversationId, content) =>
    axiosClient
      .post(`/conversations/${conversationId}/messages`, { content })
      .then((r) => r.data),
};