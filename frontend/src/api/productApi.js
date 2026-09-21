import axiosClient from "./axiosClient";

export const productApi = {
  list: (params = {}) =>
    axiosClient.get("/products", { params }).then((r) => r.data),

  listByCategory: (slug, params = {}) =>
    axiosClient
      .get(`/products/category/${slug}`, { params })
      .then((r) => r.data),

  getById: (id) => axiosClient.get(`/products/${id}`).then((r) => r.data),
};