import axiosClient from "./axiosClient";

export const categoryApi = {
  list: () => axiosClient.get("/categories").then((r) => r.data),

  getBySlug: (slug) =>
    axiosClient.get(`/categories/${slug}`).then((r) => r.data),
};