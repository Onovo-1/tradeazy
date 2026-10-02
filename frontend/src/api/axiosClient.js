import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ---- Request interceptor: attach JWT ----
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tradeazy_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor: handle 401 ----
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // DEBUG: log every error so we can see what's failing
    console.log("[API ERROR]", status, url, error.response?.data);

    // TEMPORARILY DISABLED so we can debug without being logged out
    // if (status === 401) {
    //   localStorage.removeItem("tradeazy_token");
    //   localStorage.removeItem("tradeazy_user");
    //   if (window.location.pathname !== "/login") {
    //     window.location.href = "/login";
    //   }
    // }

    return Promise.reject(error);
  }
);

export default axiosClient;