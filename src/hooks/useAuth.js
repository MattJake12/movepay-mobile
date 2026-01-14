// File: src/hooks/useAuth.js

import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useUserStore } from '../store/useUserStore';

export function useAuth() {
  const loginToStore = useUserStore((state) => state.login);

  // Hook de Login
  const loginMutation = useMutation({
    mutationFn: async ({ phone, password }) => {
      const { data } = await api.post('/auth/login', { identifier: phone, password });
      return data.data; // Retorna { user, token }
    },
    onSuccess: (data) => {
      // Salva no Zustand e Storage automaticamente
      loginToStore(data.user, data.token);
    }
  });

  // Hook de Registro
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    }
  });

  return {
    login: loginMutation,
    register: registerMutation,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error
  };
}