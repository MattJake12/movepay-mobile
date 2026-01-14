// File: src/services/api.js

import axios from 'axios';
import { storage } from './storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ⚠️ URL única para todas as requisições
const BASE_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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

// 1. Antes de enviar: Coloca o Token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('movepay_token') 
      || await AsyncStorage.getItem('movepay_token')
      || await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Ao receber: Se der erro 401 (Sessão Expirada), tenta renovar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
          || await AsyncStorage.getItem('movepay_token')
          || await storage.getToken();
        
        if (!oldToken) {
          throw new Error('No token available');
        }

        // Chamar endpoint de refresh
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          token: oldToken,
        });

        const { data: newToken } = response.data;
        
        // Salvar novo token em todos os locais
        await SecureStore.setItemAsync('movepay_token', newToken);
        await AsyncStorage.setItem('movepay_token', newToken);
        await storage.setToken(newToken);

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
        await storage.clearAll();
        
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;