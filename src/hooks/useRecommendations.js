// File: src/hooks/useRecommendations.js

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * 🤖 useRecommendations Hook
 * Busca recomendações personalizadas de IA do backend
 * Cache de 10 minutos (staleTime)
 */
export function useRecommendations() {
  return useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const { data } = await api.get('/trips/recommended');
      return data.data; // Array de viagens recomendadas
    },
    staleTime: 1000 * 60 * 10, // Cache 10 minutos
    refetchInterval: 1000 * 60 * 30, // Refetch a cada 30 minutos
    retry: 1, // Retry uma vez em caso de falha
    enabled: true // Sempre ativar
  });
}
