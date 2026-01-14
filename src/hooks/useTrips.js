// File: src/hooks/useTrips.js

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Buscar viagens com filtros
export function useTrips(searchFilters = {}, tripType = 'BUS') {
  // Transforma objeto { q: 'Luanda' } em query string
  const queryParams = new URLSearchParams({
    ...searchFilters,
    type: tripType
  }).toString();

  return useQuery({
    queryKey: ['trips', searchFilters, tripType],
    queryFn: async () => {
      const { data } = await api.get(`/trips?${queryParams}`);
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
}

// Detalhes de uma viagem específica (incluindo assentos)
export function useTripDetails(tripId) {
  return useQuery({
    queryKey: ['trip-details', tripId],
    queryFn: async () => {
      if (!tripId) return null;
      // Precisamos de dois endpoints: Detalhes da viagem e Assentos ocupados
      // Promise.all para carregar junto
      const [tripRes, seatsRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get(`/trips/${tripId}/seats`)
      ]);

      return {
        ...tripRes.data.data, // Dados da viagem
        seatData: seatsRes.data.data // Dados de ocupação { occupiedSeats: [...] }
      };
    },
    enabled: !!tripId, // Só roda se tiver ID
  });
}