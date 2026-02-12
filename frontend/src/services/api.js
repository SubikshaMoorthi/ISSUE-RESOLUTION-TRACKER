import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// This "Interceptor" attaches the token to every single request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Get the token you saved during login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;