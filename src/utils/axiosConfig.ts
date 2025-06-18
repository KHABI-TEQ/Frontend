import axios from 'axios';

const api = axios.create({
  baseURL: 'https://khabiteq-realty.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken'); // or wherever you store the token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
