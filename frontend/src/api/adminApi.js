import axiosClient from "./axiosClient";

export const adminApi = {
  dashboard: () => axiosClient.get("/admin/dashboard").then((r) => r.data),

  listUsers: (params = {}) =>
    axiosClient.get("/admin/users", { params }).then((r) => r.data),

  suspendUser: (id) =>
    axiosClient.patch(`/admin/users/${id}/suspend`).then((r) => r.data),

  activateUser: (id) =>
    axiosClient.patch(`/admin/users/${id}/activate`).then((r) => r.data),

  listProducts: (params = {}) =>
    axiosClient.get("/admin/products", { params }).then((r) => r.data),

  removeProduct: (id) => axiosClient.delete(`/admin/products/${id}`),

  restoreProduct: (id) =>
    axiosClient.patch(`/admin/products/${id}/restore`).then((r) => r.data),
};