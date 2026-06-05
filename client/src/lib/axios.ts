import Axios from "axios";
import { extractErrorMessage } from "./extractErrorMessage";

const apiClient = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = extractErrorMessage(error);
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
