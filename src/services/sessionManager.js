// File: src/services/sessionManager.js

/**
 * Session Management Service - App Móvel
 * Gerencia login, logout, refresh token e estado de autenticação
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { signOut } from 'expo-auth-session';
import api from '../lib/api';

const KEYS = {
  TOKEN: 'movepay_token',
  USER: 'movepay_user',
  DEVICE_TOKEN: 'movepay_device_token',
  LAST_LOGIN: 'movepay_last_login',
  AUTH_METHOD: 'movepay_auth_method', // 'phone', 'google', etc
};

/**
 * Salvar sessão após login
 */
export async function saveSession(token, user, authMethod = 'phone') {
  try {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    await AsyncStorage.setItem(KEYS.AUTH_METHOD, authMethod);
    await AsyncStorage.setItem(KEYS.LAST_LOGIN, new Date().toISOString());

    // Também salvar em SecureStore para segurança extra
    await SecureStore.setItemAsync(KEYS.TOKEN, token);

    return true;
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    throw error;
  }
}

/**
 * Obter token armazenado
 */
export async function getToken() {
  try {
    // Tentar primeiro no SecureStore (mais seguro)
    let token = await SecureStore.getItemAsync(KEYS.TOKEN);
    
    // Fallback para AsyncStorage
    if (!token) {
      token = await AsyncStorage.getItem(KEYS.TOKEN);
    }

    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
}

/**
 * Obter dados do usuário
 */
export async function getUser() {
  try {
    const userData = await AsyncStorage.getItem(KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
}

/**
 * Obter método de autenticação usado
 */
export async function getAuthMethod() {
  try {
    return await AsyncStorage.getItem(KEYS.AUTH_METHOD) || 'phone';
  } catch (error) {
    return 'phone';
  }
}

/**
 * Fazer logout completo
 */
export async function logout() {
  try {
    // Notificar backend que está saindo
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignorar erro se backend falhar
      console.warn('Erro ao notificar logout no backend:', err);
    }

    // Limpar AsyncStorage
    await AsyncStorage.removeItem(KEYS.TOKEN);
    await AsyncStorage.removeItem(KEYS.USER);
    await AsyncStorage.removeItem(KEYS.DEVICE_TOKEN);
    await AsyncStorage.removeItem(KEYS.LAST_LOGIN);

    // Limpar SecureStore
    try {
      await SecureStore.deleteItemAsync(KEYS.TOKEN);
    } catch (err) {
      console.warn('Erro ao limpar SecureStore:', err);
    }

    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

/**
 * Logout do Google (se aplicável)
 */
export async function logoutGoogle() {
  try {
    // Se usando Google Auth, limpar sessão do Google também
    const authMethod = await getAuthMethod();
    
    if (authMethod === 'google') {
      // Aqui você pode chamar signOut() do expo-auth-session se necessário
      console.log('Google Auth logout');
    }

    // Fazer logout normal
    await logout();
  } catch (error) {
    console.error('Erro ao fazer logout Google:', error);
    throw error;
  }
}

/**
 * Renovar token (refresh)
 */
export async function refreshToken() {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Nenhum token disponível');
    }

    // Chamada ao backend para renovar
    const response = await api.post('/auth/refresh', { token });
    
    const { token: newToken, user } = response.data.data;

    // Atualizar sessão com novo token
    await saveSession(newToken, user);

    return newToken;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    // Se falhar, fazer logout
    await logout();
    throw error;
  }
}

/**
 * Verificar se sessão é válida
 */
export async function isSessionValid() {
  try {
    const token = await getToken();
    const user = await getUser();

    return !!(token && user);
  } catch (error) {
    return false;
  }
}

/**
 * Obter tempo desde último login
 */
export async function getLastLoginTime() {
  try {
    const lastLogin = await AsyncStorage.getItem(KEYS.LAST_LOGIN);
    return lastLogin ? new Date(lastLogin) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Limpar cache de dados (mas manter sessão)
 */
export async function clearCache() {
  try {
    // Limpar dados de queries, dados locais, etc
    // Mantém token e usuário intactos
    await AsyncStorage.removeItem('trips_cache');
    await AsyncStorage.removeItem('bookings_cache');
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

/**
 * Exportar todas as funções
 */
export default {
  saveSession,
  getToken,
  getUser,
  getAuthMethod,
  logout,
  logoutGoogle,
  refreshToken,
  isSessionValid,
  getLastLoginTime,
  clearCache,
};
