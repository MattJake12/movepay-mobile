// mobile/src/hooks/useDriverTracking.js

/**
 * 🚗 DRIVER TRACKING HOOK
 * 
 * Gerencia o rastreamento GPS do motorista
 * - Lê localização em tempo real
 * - Envia via Socket.io ao backend
 * - Gerencia permissões e bateria
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

const UPDATE_INTERVAL = 5000; // 5 segundos
const MIN_ACCURACY = 50; // metros

export const useDriverTracking = (tripId, enabled = true) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket('/gps');
  
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [stats, setStats] = useState({
    speed: 0,
    heading: 0,
    accuracy: 0,
    distance: 0,
    duration: 0
  });

  const locationSubscriptionRef = useRef(null);
  const trackingStartTimeRef = useRef(null);
  const previousLocationRef = useRef(null);
  const totalDistanceRef = useRef(0);

  /**
   * Iniciar rastreamento GPS
   */
  const startTracking = useCallback(async () => {
    try {
      if (!tripId || !socket || !isConnected) {
        console.warn('❌ Cannot start tracking: Missing dependencies');
        return;
      }

      // Solicitar permissão de localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização foi negada');
        return;
      }

      // Também solicitar permissão de background location
      const bgStatus = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== 'granted') {
        console.warn('⚠️ Background location permission not granted');
      }

      setIsTracking(true);
      trackingStartTimeRef.current = Date.now();
      totalDistanceRef.current = 0;

      // Notificar backend que começou rastreamento
      socket.emit('driver-login', {
        tripId,
        driverId: user?.id,
        companyId: user?.companyId
      });

      console.log('🚗 Driver tracking started');

      // Iniciar subscription de localização (HIGH ACCURACY)
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation, // Máxima precisão
          timeInterval: UPDATE_INTERVAL,
          distanceInterval: 5 // Atualizar a cada 5 metros também
        },
        (newLocation) => {
          handleLocationUpdate(newLocation);
        }
      );
    } catch (err) {
      console.error('Error starting tracking:', err);
      setError(err.message);
      setIsTracking(false);
    }
  }, [tripId, socket, isConnected, user]);

  /**
   * Processar atualização de localização
   */
  const handleLocationUpdate = useCallback((newLocation) => {
    try {
      const { coords } = newLocation;
      const { latitude, longitude, accuracy, speed, heading } = coords;

      // Validar precisão (não enviar se muito impreciso)
      if (accuracy > MIN_ACCURACY) {
        return;
      }

      // Calcular distância percorrida
      if (previousLocationRef.current) {
        const distance = calculateDistance(
          previousLocationRef.current.latitude,
          previousLocationRef.current.longitude,
          latitude,
          longitude
        );
        totalDistanceRef.current += distance;
      }

      previousLocationRef.current = { latitude, longitude };

      // Atualizar estado local
      setLocation({
        latitude,
        longitude,
        accuracy,
        speed: speed || 0,
        heading: heading || 0,
        timestamp: new Date()
      });

      // Atualizar estatísticas
      const duration = (Date.now() - trackingStartTimeRef.current) / 1000; // segundos
      setStats({
        speed: (speed || 0).toFixed(1),
        heading: (heading || 0).toFixed(1),
        accuracy: accuracy.toFixed(1),
        distance: (totalDistanceRef.current / 1000).toFixed(2), // km
        duration: formatDuration(duration)
      });

      // Enviar ao backend via Socket.io
      if (socket && isConnected) {
        socket.emit('send-location', {
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          accuracy: accuracy.toFixed(1),
          speed: (speed || 0).toFixed(1),
          heading: (heading || 0).toFixed(1),
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error handling location update:', err);
    }
  }, [socket, isConnected]);

  /**
   * Parar rastreamento
   */
  const stopTracking = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    setIsTracking(false);
    totalDistanceRef.current = 0;
    previousLocationRef.current = null;
    console.log('🛑 Driver tracking stopped');
  }, []);

  /**
   * Atualizar status da viagem
   */
  const updateTripStatus = useCallback((status) => {
    if (socket && isConnected) {
      socket.emit('trip-status-update', {
        tripId,
        status
      });
    }
  }, [tripId, socket, isConnected]);

  /**
   * Efeito: Auto-start quando ativado
   */
  useEffect(() => {
    if (enabled && isConnected && !isTracking) {
      startTracking();
    }

    return () => {
      if (enabled && isTracking) {
        // Não parar automaticamente, deixar o usuário controlar
      }
    };
  }, [enabled, isConnected, isTracking, startTracking]);

  return {
    location,
    isTracking,
    error,
    stats,
    startTracking,
    stopTracking,
    updateTripStatus
  };
};

/**
 * Calcular distância entre dois pontos (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // em metros
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Formatar duração em hh:mm:ss
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
