import axios from 'axios';
import { URLS } from './URLS';

const api = axios.create({
  baseURL: URLS.BASE,
});

api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }
  } catch (_) {
    // ignore storage access errors in non-browser contexts
  }
  return config;
});

export default api;
