import axiosClient from "./axiosClient";

export const sellerApi = {
  myProducts: (params = {}) =>
    axiosClient.get("/products/seller", { params }).then((r) => r.data),

  myProduct: (id) =>
    axiosClient.get(`/products/${id}`).then((r) => r.data),

  create: (data) => 
    axiosClient.post("/products", data).then((r) => r.data),

  update: (id, data) => 
    axiosClient.put(`/products/${id}`, data).then((r) => r.data),

  delete: (id) => 
    axiosClient.delete(`/products/${id}`).then((r) => r.data),

  uploadImage: (productId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(`/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  images: (productId) =>
    axiosClient.get(`/products/${productId}/images`).then((r) => r.data),

  deleteImage: (productId, imageId) =>
    axiosClient.delete(`/products/${productId}/images/${imageId}`).then((r) => r.data),

  setPrimaryImage: (productId, imageId) =>
    axiosClient.patch(`/products/${productId}/images/${imageId}/primary`).then((r) => r.data),
};