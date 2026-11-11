import axiosClient from "./axiosClient";

export const productApi = {
  list: (params = {}) =>
    axiosClient.get("/products", { params }).then((r) => r.data),

  listByCategory: (slug, params = {}) =>
    axiosClient.get(`/products/category/${slug}`, { params }).then((r) => r.data),

  getById: (id) => 
    axiosClient.get(`/products/${id}`).then((r) => r.data),

  // Updated to support category filter in search
  search: (params = {}) =>
    axiosClient.get("/products", { params }).then((r) => r.data),

  listMyProducts: (params = {}) =>
    axiosClient.get("/products/seller", { params }).then((r) => r.data),

  create: (data) => 
    axiosClient.post("/products", data).then((r) => r.data),

  update: (id, data) => 
    axiosClient.put(`/products/${id}`, data).then((r) => r.data),

  delete: (id) => 
    axiosClient.delete(`/products/${id}`).then((r) => r.data),

  markSold: (id) =>
    axiosClient.patch(`/products/${id}/sell`).then((r) => r.data),
};