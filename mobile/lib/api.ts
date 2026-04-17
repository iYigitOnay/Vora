import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import Constants from "expo-constants";

const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

console.log("Vora API Bağlantı Adresi:", baseURL);

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Merkezi 401 Koruması: Token geçersizse anında logout yap
    if (error.response?.status === 401) {
      console.log("Yetkisiz Erişim! Giriş sayfasına yönlendiriliyorsunuz...");
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
