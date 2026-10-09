import axiosClient from "./axiosClient";

export const orderApi = {
  // Buyer creates an order
  create: (payload) =>
    axiosClient.post("/orders", payload).then((r) => r.data),

  // Buyer's own orders
  mine: (params = {}) =>
    axiosClient.get("/orders/mine", { params }).then((r) => r.data),

  // Seller's incoming orders
  forSeller: (params = {}) =>
    axiosClient.get("/orders/seller", { params }).then((r) => r.data),

  // Single order
  get: (id) => axiosClient.get(`/orders/${id}`).then((r) => r.data),

  // Seller updates status
  updateStatus: (id, status) =>
    axiosClient
      .patch(`/orders/${id}/status`, { status })
      .then((r) => r.data),

  // Buyer cancels order
  cancel: (id) =>
    axiosClient.patch(`/orders/${id}/cancel`).then((r) => r.data),
};