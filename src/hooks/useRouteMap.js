// File: src/hooks/useRouteMap.js

/**
 * 🗺️ Hook: useRouteMap
 * Busca dados da rota com coordenadas, paragens e calcula informações do trajeto
 */

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  getCityCoordinates,
  getStopsWithCoordinates,
  calculateDistance,
  calculateEstimatedTime,
  getDetailedRoute,
} from '../lib/angolaCities';

export const useRouteMap = (tripId) => {
  return useQuery({
    queryKey: ['route-map', tripId],
    queryFn: async () => {
      // Buscar dados da viagem
      const { data } = await api.get(`/trips/${tripId}`);
      const trip = data.data;

      // Obter coordenadas das cidades
      const originCoords = getCityCoordinates(trip.origin);
      const destinationCoords = getCityCoordinates(trip.destination);

      if (!originCoords || !destinationCoords) {
        throw new Error('Coordenadas não encontradas');
      }

      // Obter paragens intermediárias (se houver)
      const stopsData =
        trip.stops && trip.stops.length > 0 ? getStopsWithCoordinates(trip.stops) : [];

      // OBTER ROTA DETALHADA (PRIORIDADE)
      // Isso evita que a rota Luanda-Benguela passe pelo mar
      const detailedPoints = getDetailedRoute(trip.origin, trip.destination);
      
      let trajectory = [];
      
      if (detailedPoints && detailedPoints.length > 2) {
        // Se temos waypoints detalhados (ex: Luanda-Benguela), usamos eles com alta precisão
        trajectory = detailedPoints.map(p => ({ latitude: p.lat, longitude: p.lng }));
      } else {
        // Fallback: Construir trajeto simples (origem → paragens → destino)
        trajectory = [
          { latitude: originCoords.lat, longitude: originCoords.lng },
          ...stopsData.map((stop) => ({ latitude: stop.lat, longitude: stop.lng })),
          { latitude: destinationCoords.lat, longitude: destinationCoords.lng },
        ];
      }

      // Calcular distância total
      let totalDistance = 0;
      for (let i = 0; i < trajectory.length - 1; i++) {
        totalDistance += calculateDistance(
          trajectory[i].latitude,
          trajectory[i].longitude,
          trajectory[i + 1].latitude,
          trajectory[i + 1].longitude
        );
      }

      return {
        trip,
        originCoords,
        destinationCoords,
        stopsData,
        trajectory,
        totalDistance: Math.round(totalDistance * 10) / 10, // 1 decimal
        estimatedTime: calculateEstimatedTime(totalDistance),

        // Para debug
        debug: {
          stopsCount: stopsData.length,
          trajectoryPoints: trajectory.length,
        },
      };
    },
    enabled: !!tripId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Calcular bounds do mapa para enquadrar toda a rota
 */
export const calculateMapBounds = (trajectory) => {
  let maxLat = -90,
    minLat = 90;
  let maxLng = -180,
    minLng = 180;

  trajectory.forEach((point) => {
    maxLat = Math.max(maxLat, point.latitude);
    minLat = Math.min(minLat, point.latitude);
    maxLng = Math.max(maxLng, point.longitude);
    minLng = Math.min(minLng, point.longitude);
  });

  return {
    latitude: (maxLat + minLat) / 2,
    longitude: (maxLng + minLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.2, // 20% extra padding
    longitudeDelta: (maxLng - minLng) * 1.2,
  };
};
