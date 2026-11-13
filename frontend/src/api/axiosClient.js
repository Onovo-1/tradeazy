import axios from "axios";

const axiosClient = axios.create({
  // HARDCODED URL - No environment variables needed
  baseURL: "https://tradeazy-production-06d81663.up.railway.app/api", 
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("tradeazy_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;