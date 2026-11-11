import axiosClient from "./axiosClient";

export const offerApi = {
  create: (conversationId, amount, note) =>
    axiosClient.post("/offers", { conversationId, amount, note }).then((r) => r.data),

  buyNow: (conversationId) =>
    axiosClient.post(`/offers/buy-now?conversationId=${conversationId}`).then((r) => r.data),

  update: (offerId, amount, note) =>
    axiosClient.put(`/offers/${offerId}`, { amount, note }).then((r) => r.data),

  delete: (offerId) =>
    axiosClient.delete(`/offers/${offerId}`).then((r) => r.data),

  accept: (offerId) =>
    axiosClient.put(`/offers/${offerId}/accept`).then((r) => r.data),

  reject: (offerId) =>
    axiosClient.put(`/offers/${offerId}/reject`).then((r) => r.data),

  counter: (offerId, amount, note) =>
    axiosClient.post(`/offers/${offerId}/counter`, { amount, note }).then((r) => r.data),

  pay: (offerId) =>
    axiosClient.post(`/offers/${offerId}/pay`).then((r) => r.data),

  listByConversation: (conversationId) =>
    axiosClient.get(`/offers/conversation/${conversationId}`).then((r) => r.data),
};