import axiosClient from "./axiosClient";

export const offerApi = {
  create: (conversationId, amount, note, quantity = 1) =>
    axiosClient.post("/offers", { conversationId, amount, note, quantity }).then((r) => r.data),

  buyNow: (conversationId) =>
    axiosClient.post(`/offers/buy-now?conversationId=${conversationId}`).then((r) => r.data),

  update: (offerId, amount, note, quantity = 1) =>
    axiosClient.put(`/offers/${offerId}`, { amount, note, quantity }).then((r) => r.data),

  delete: (offerId) =>
    axiosClient.delete(`/offers/${offerId}`).then((r) => r.data),

  accept: (offerId) =>
    axiosClient.put(`/offers/${offerId}/accept`).then((r) => r.data),

  reject: (offerId) =>
    axiosClient.put(`/offers/${offerId}/reject`).then((r) => r.data),

  counter: (offerId, amount, note, quantity = 1) =>
    axiosClient.post(`/offers/${offerId}/counter`, { amount, note, quantity }).then((r) => r.data),

  pay: (offerId, quantity = 1) =>
    axiosClient.post(`/offers/${offerId}/pay`, { quantity }).then((r) => r.data),

  listByConversation: (conversationId) =>
    axiosClient.get(`/offers/conversation/${conversationId}`).then((r) => r.data),
};