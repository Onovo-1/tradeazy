import axiosClient from "./axiosClient";

export const favoriteApi = {
  add: (productId) =>
    axiosClient.post(`/favorites/${productId}`).then((r) => r.data),

  remove: (productId) =>
    axiosClient.delete(`/favorites/${productId}`).then((r) => r.data),

  list: (params = {}) =>
    axiosClient.get("/favorites", { params }).then((r) => r.data),

  check: (productId) =>
    axiosClient.get(`/favorites/check/${productId}`).then((r) => r.data),

  count: () => axiosClient.get("/favorites/count").then((r) => r.data),
};