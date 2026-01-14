// File: src/hooks/useCompanies.js

/**
 * 🏢 useCompaniesQuery Hook
 * Busca todas as operadoras/companies disponíveis
 */

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useCompaniesQuery = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data } = await api.get('/companies');
      return data.data || data; // Adapta conforme a estrutura da API
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora (antes era cacheTime)
    retry: 2,
  });
};

export default useCompaniesQuery;
