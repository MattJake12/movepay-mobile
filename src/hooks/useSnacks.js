// File: src/hooks/useSnacks.js

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useSnacksQuery() {
  return useQuery({
    queryKey: ['snacks'],
    queryFn: async () => {
      const { data } = await api.get('/snacks');
      return data.data || data; // Adapta conforme a estrutura da API
    },
    staleTime: 1000 * 60 * 60,
  });
}
