import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const isAuthRequest = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !error.config._retry && !isAuthRequest) {
      error.config._retry = true;
      try {
        await useAuthStore.getState().checkAuth();
        return client(error.config);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
