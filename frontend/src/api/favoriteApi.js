import axiosClient from "./axiosClient";

export const favoriteApi = {
  add: (productId) => 
    axiosClient.post(`/favorites/${productId}`).then((r) => r.data),

  remove: (productId) => 
    axiosClient.delete(`/favorites/${productId}`).then((r) => r.data),

  list: () => 
    axiosClient.get("/favorites").then((r) => r.data),

  // Added the missing check function
  check: (productId) => 
    axiosClient.get(`/favorites/check/${productId}`).then((r) => r.data),
};