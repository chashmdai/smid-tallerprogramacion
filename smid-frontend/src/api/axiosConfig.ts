import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smid_token');
    
    console.log(
      "Interceptor Axios ejecutándose. ¿Hay token?:",
      token
        ? "SÍ, el token es: " + token.substring(0, 15) + "..."
        : "NO, el token es NULL"
    );
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);