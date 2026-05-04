import axios from "axios";
import { useAppStore } from "../store/useAppStore";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
