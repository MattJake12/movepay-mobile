// File: src/services/googleAuth.js

/**
 * Google Authentication Service - React Native
 * Integração com Google Sign-In para Expo
 */

import * as Google from 'expo-auth-session/providers/google';
import api from '../lib/api';
import { useUserStore } from '../store/useUserStore';

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

let request, response, promptAsync;

export async function initializeGoogleAuth() {
  try {
    [request, response, promptAsync] = Google.useAuthRequest({
      clientId: CLIENT_ID,
      scopes: ['profile', 'email'],
    });
    return { request, response, promptAsync };
  } catch (error) {
    console.error('Erro ao inicializar Google Auth:', error);
    throw error;
  }
}

/**
 * Fazer login com Google
 * @returns { user, token }
 */
export async function signInWithGoogle(response) {
  try {
    if (!response?.authentication) {
      throw new Error('Autenticação cancelada');
    }

    const { idToken, accessToken } = response.authentication;

    // Enviar para backend verificar e criar/atualizar usuário
    const apiResponse = await api.post('/auth/google', {
      idToken,
      accessToken,
    });

    const { token, user } = apiResponse.data.data;

    // ✅ Atualizar Zustand store (que também salva no AsyncStorage)
    useUserStore.getState().login(user, token);
    console.log('🔐 [Google] Login OK - User:', user.name, 'Role:', user.role);

    return { user, token };
  } catch (error) {
    console.error('Erro no login Google:', error);
    throw error;
  }
}

/**
 * Fazer registro com Google
 */
export async function signUpWithGoogle(response) {
  try {
    if (!response?.authentication) {
      throw new Error('Autenticação cancelada');
    }

    const { idToken } = response.authentication;

    // Backend vai criar novo usuário se não existir
    const apiResponse = await api.post('/auth/google-signup', {
      idToken,
    });

    const { token, user } = apiResponse.data.data;

    // ✅ Atualizar Zustand store (que também salva no AsyncStorage)
    useUserStore.getState().login(user, token);
    console.log('🔐 [Google] Signup OK - User:', user.name, 'Role:', user.role);

    return { user, token };
  } catch (error) {
    console.error('Erro no registro Google:', error);
    throw error;
  }
}

/**
 * Logout
 */
export async function signOutGoogle() {
  try {
    // ✅ Usar Zustand store para logout (limpa AsyncStorage também)
    await useUserStore.getState().logout();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}
