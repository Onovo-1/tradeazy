import axiosClient from "./axiosClient";

export const sellerApi = {
  // List current seller's products (paginated, all statuses)
  myProducts: (params = {}) =>
    axiosClient.get("/products/mine", { params }).then((r) => r.data),

  // Get one product owned by current seller (any status)
  myProduct: (id) =>
    axiosClient.get(`/products/mine/${id}`).then((r) => r.data),

  // Create a product
  create: (payload) =>
    axiosClient.post("/products", payload).then((r) => r.data),

  // Update a product
  update: (id, payload) =>
    axiosClient.put(`/products/${id}`, payload).then((r) => r.data),

  // Soft-delete a product
  remove: (id) => axiosClient.delete(`/products/${id}`),

  // Mark as sold
  markSold: (id) =>
    axiosClient.patch(`/products/${id}/sold`).then((r) => r.data),

  // Upload an image for a product (multipart)
  uploadImage: (productId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient
      .post(`/products/${productId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // List images of a product
  images: (productId) =>
    axiosClient.get(`/products/${productId}/images`).then((r) => r.data),

  // Delete an image
  deleteImage: (productId, imageId) =>
    axiosClient.delete(`/products/${productId}/images/${imageId}`),

  // Set primary image
  setPrimaryImage: (productId, imageId) =>
    axiosClient
      .patch(`/products/${productId}/images/${imageId}/primary`)
      .then((r) => r.data),
};