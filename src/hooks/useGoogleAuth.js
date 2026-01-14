// File: src/hooks/useGoogleAuth.js

/**
 * Hook: useGoogleAuth
 * Gerencia autenticação com Google no app móvel
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithGoogle, signUpWithGoogle } from '../services/googleAuth';

export function useGoogleAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  // Monitorar resposta do Google
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    }
  }, [response]);

  const handleGoogleResponse = async (googleResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      // Tentar login primeiro
      try {
        const result = await signInWithGoogle(googleResponse);
        // ✅ Login bem-sucedido
        router.replace('/(tabs)/home');
      } catch (loginError) {
        // Se falhar, tentar registro
        if (loginError.response?.status === 404) {
          const result = await signUpWithGoogle(googleResponse);
          // ✅ Registro bem-sucedido
          router.replace('/(tabs)/home');
        } else {
          throw loginError;
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar com Google');
      console.error('Erro Google Auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      if (result?.type !== 'success') {
        setError('Autenticação cancelada');
      }
    } catch (err) {
      setError('Erro ao iniciar login Google');
      console.error(err);
    }
  };

  return {
    handleGoogleSignIn,
    isLoading,
    error,
    request,
    isGoogleAuthReady: !!request,
  };
}
