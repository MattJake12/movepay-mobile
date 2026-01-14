// File: src/hooks/useAuthFlow.js

/**
 * 🔐 useAuthFlow Hook
 * 
 * Hook unificado para autenticação Mobile
 * Trata Login Tradicional e Google OAuth com Smart Linking
 * 
 * Uso:
 * const { handleTraditionalLogin, handleGoogleLogin, isLoading } = useAuthFlow();
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import api from '../services/api';
import { useUserStore } from '../store/useUserStore';

export function useAuthFlow() {
  const router = useRouter();
  const loginToStore = useUserStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // Configuração Google OAuth (Expo)
  // ============================================
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  });

  // ============================================
  // 1️⃣ LOGIN TRADICIONAL (Email/Phone + Senha)
  // ============================================
  const handleTraditionalLogin = async (identifier, password) => {
    setIsLoading(true);
    try {
      console.log(`🔵 useAuthFlow: Login tradicional - ${identifier}`);

      // O backend é inteligente:
      // - identifier pode ser email ou telefone
      // - Detecta contas Google-only e retorna erro específico
      const { data } = await api.post('/auth/login', { 
        identifier, 
        password 
      });
      
      console.log(`✅ Login bem-sucedido: ${data.data.user.id}`);
      
      // Armazenar no Zustand
      loginToStore(data.data.user, data.data.token);
      
      // Redirecionar para home
      router.replace('/(tabs)/home');

    } catch (error) {
      const msg = error.response?.data?.message || "Erro de conexão";
      
      console.error(`❌ Erro no login: ${msg}`);
      
      // ============================================
      // TRATAMENTO ESPECIAL: Conta Google-Only
      // ============================================
      if (msg.includes('Entrar com Google') || msg.includes('Google OAuth')) {
        Alert.alert(
          "⚠️ Conta criada com Google",
          msg,
          [
            { 
              text: "Entrar com Google", 
              onPress: () => promptAsync()
            },
            { 
              text: "Redefinir Senha", 
              onPress: () => {
                // TODO: Implementar reset de senha
                Alert.alert("Em desenvolvimento", "Recuperação de senha em breve");
              }
            },
            { 
              text: "Cancelar", 
              style: "cancel" 
            }
          ]
        );
      } else {
        // Erro genérico
        Alert.alert("❌ Erro de Login", msg);
      }

    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 2️⃣ LOGIN/CADASTRO GOOGLE (Smart Linking)
  // ============================================
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      console.log(`🔵 useAuthFlow: Iniciando Google Auth...`);

      // Prompt do Google
      const res = await promptAsync();
      
      if (res?.type !== 'success') {
        console.warn(`⚠️ Google Auth cancelado pelo usuário`);
        setIsLoading(false);
        return;
      }

      // Pegar o token
      const idToken = res.params?.id_token || res.authentication?.idToken;
      
      if (!idToken) {
        throw new Error('Google ID Token não recebido');
      }

      console.log(`✅ Google token recebido`);
      
      // ============================================
      // Enviar para o backend
      // O backend faz tudo:
      // - Validação do token
      // - Verificação se é novo usuário
      // - Smart Linking se email já existe
      // - Retorna token JWT
      // ============================================
      const { data } = await api.post('/auth/google', { 
        idToken 
      });

      console.log(`✅ Google Auth bem-sucedido: ${data.data.user.id}`);
      
      // Armazenar no Zustand
      loginToStore(data.data.user, data.data.token);
      
      // Mensagem de sucesso
      if (res.type === 'success' && data.data.user.createdAt) {
        // Se é novo usuário, mostrar mensagem diferente
        Alert.alert(
          "🎉 Bem-vindo ao MovePay!",
          "Sua conta foi criada com sucesso via Google"
        );
      }
      
      // Redirecionar para home
      router.replace('/(tabs)/home');

    } catch (error) {
      console.error(`❌ Erro na Google Auth: ${error.message}`);
      
      Alert.alert(
        "❌ Erro na Autenticação",
        error.response?.data?.message || 
        error.message || 
        "Falha ao autenticar com o Google"
      );

    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 3️⃣ CADASTRO TRADICIONAL
  // ============================================
  const handleTraditionalRegister = async (name, identifier, password, biNumber) => {
    setIsLoading(true);
    try {
      console.log(`🔵 useAuthFlow: Novo registro`);

      // Validação básica
      if (!name || !password) {
        Alert.alert("Erro", "Nome e palavra-passe são obrigatórios");
        setIsLoading(false);
        return;
      }

      // Determinar se é email ou telefone
      const isEmail = identifier.includes('@');
      const payload = {
        name,
        password,
        biNumber: biNumber || null
      };

      if (isEmail) {
        payload.email = identifier;
      } else {
        payload.phone = identifier;
      }

      const { data } = await api.post('/auth/register', payload);

      console.log(`✅ Registro bem-sucedido: ${data.data.user.id}`);
      
      loginToStore(data.data.user, data.data.token);
      
      Alert.alert("🎉 Bem-vindo!", "Sua conta foi criada com sucesso");
      
      router.replace('/(tabs)/home');

    } catch (error) {
      console.error(`❌ Erro no registro: ${error.message}`);
      
      Alert.alert(
        "❌ Erro no Registro",
        error.response?.data?.message || error.message
      );

    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Funções principais
    handleTraditionalLogin,
    handleGoogleLogin,
    handleTraditionalRegister,
    
    // Estados
    isLoading,
    isGoogleReady: !!request,
    
    // Helpers
    promptGoogleAsync: promptAsync
  };
}
