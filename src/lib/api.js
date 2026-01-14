// File: src/lib/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ⚠️ TROQUE PELO SEU IP LOCAL (Não use localhost)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://movepay-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos - suficiente para Render.com + rede móvel
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// INTERCEPTOR 1: Enviar o Token automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('movepay_token') 
      || await AsyncStorage.getItem('movepay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR 2: Se o token expirar, renovar automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // NÃO tentar renovar token em endpoints de autenticação (login, register, etc)
    const isAuthEndpoint = originalRequest.url.includes('/auth/login') 
      || originalRequest.url.includes('/auth/register') 
      || originalRequest.url.includes('/auth/google');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const oldToken = await SecureStore.getItemAsync('movepay_token') 
          || await AsyncStorage.getItem('movepay_token');
        
        if (!oldToken) {
          throw new Error('No token available');
        }

        // Chamar endpoint de refresh
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          token: oldToken,
        });

        const { data: newToken } = response.data;
        
        // Salvar novo token
        await SecureStore.setItemAsync('movepay_token', newToken);
        await AsyncStorage.setItem('movepay_token', newToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        
        // Falhou o refresh, fazer logout
        await SecureStore.deleteItemAsync('movepay_token');
        await AsyncStorage.removeItem('movepay_token');
        await AsyncStorage.removeItem('movepay_user');
        
        // Aqui você pode redirecionar para login
        // router.push('/login');
        
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;