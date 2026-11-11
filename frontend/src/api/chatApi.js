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
    axiosClient.get(`/conversations/${conversationId}/messages`, { params }).then((r) => r.data),

  sendMessage: (conversationId, content) =>
    axiosClient.post(`/conversations/${conversationId}/messages`, { content }).then((r) => r.data),

  // Changed to use the product upload endpoint
  uploadChatImage: (conversationId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(`/products/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }).then((r) => r.data);
  },
    
  editMessage: (conversationId, messageId, content) =>
    axiosClient.put(`/conversations/${conversationId}/messages/${messageId}`, { content }).then((r) => r.data),

  deleteMessage: (conversationId, messageId) =>
    axiosClient.delete(`/conversations/${conversationId}/messages/${messageId}`).then((r) => r.data),
};