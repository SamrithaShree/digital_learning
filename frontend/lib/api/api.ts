import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Only add token to requests that aren't login/register
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  
  // Don't add token to login/register endpoints
  const noAuthEndpoints = ['/auth/login/', '/auth/register/', '/auth/register/teacher/'];
  const isAuthEndpoint = noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Token ${token}`;
  }
  
  return config;
});

export default api;