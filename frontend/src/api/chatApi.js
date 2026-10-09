import axiosClient from "./axiosClient";

export const chatApi = {
  startConversation: (productId) =>
    axiosClient.post("/conversations", { productId }).then((r) => r.data),

  listConversations: (params = {}) =>
    axiosClient.get("/conversations", { params }).then((r) => r.data),

  getConversation: (id) =>
    axiosClient.get(`/conversations/${id}`).then((r) => r.data),

  markRead: (id) =>
    axiosClient.patch(`/conversations/${id}/read`).then((r) => r.data),

  unreadCount: () =>
    axiosClient.get("/conversations/unread-count").then((r) => r.data),

  listMessages: (conversationId, params = {}) =>
    axiosClient
      .get(`/conversations/${conversationId}/messages`, { params })
      .then((r) => r.data),

  sendMessage: (conversationId, content) =>
    axiosClient
      .post(`/conversations/${conversationId}/messages`, { content })
      .then((r) => r.data),
};