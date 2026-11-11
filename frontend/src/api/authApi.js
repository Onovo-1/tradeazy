import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => axiosClient.post("/auth/login", data).then((res) => res.data),
  register: (data) => axiosClient.post("/auth/register", data).then((res) => res.data),
  getMe: () => axiosClient.get("/auth/me").then((res) => res.data),
};