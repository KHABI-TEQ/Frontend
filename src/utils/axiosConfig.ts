import axios from 'axios';
import { URLS } from './URLS';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: URLS.BASE,
});

api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore storage access errors in non-browser contexts
  }
  return config;
});

export default api;
