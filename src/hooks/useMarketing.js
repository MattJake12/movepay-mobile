/**
 * 📢 useMarketing Hook
 * ✅ MISSÃO 4: Gerenciamento de dados de marketing
 * Usa React Query para cache e sincronização
 */

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data } = await api.get('/marketing/banners');
      return data.data || [];
    },
    staleTime: 1000 * 60 * 30, // Cache de 30 minutos
    cacheTime: 1000 * 60 * 45, // Manter em memória por 45 min
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}
