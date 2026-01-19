/**
 * 🚌 Driver Tracker Screen
 * Rastreamento GPS em tempo real com Socket.io
 * ✅ MISSÃO 1: Realtime GPS com simulação integrada
 *
 * Funcionalidades:
 * - Conexão Socket.io robusta
 * - Motor de simulação GPS
 * - Envio de localização em tempo real
 * - Mapa MapLibre com marcador animado
 * - HUD com status e velocidade
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

import MapView, {
  MarkerView,
  Camera
} from '@maplibre/maplibre-react-native';

import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import io from 'socket.io-client';

import { OperatorGuard } from '../../src/components/OperatorGuard';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

/* =======================
   CONFIGURAÇÕES
======================= */

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || 'https://movepay-api.onrender.com';

// Luanda - Angola
const INITIAL_COORDS = {
  latitude: -8.83833,
  longitude: 13.23444
};

/* =======================
   STYLED COMPONENTS
======================= */

const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[900]};
`;

const HUD = styled.View`
  position: absolute;
  bottom: ${spacing[6]}px;
  left: ${spacing[4]}px;
  right: ${spacing[4]}px;
  background-color: rgba(15, 23, 42, 0.95);
  padding: ${spacing[6]}px;
  border-radius: 16px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
  align-items: center;
`;

const StatusContainer = styled.View`
  width: 100%;
  margin-bottom: ${spacing[4]}px;
  align-items: center;
`;

const StatusIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const StatusDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${props =>
    props.isConnected ? '#10b981' : '#ef4444'};
`;

const StatusText = styled.Text`
  color: ${props =>
    props.isConnected ? colors.emerald[400] : colors.red[400]};
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.semibold};
`;

const SpeedContainer = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: ${spacing[2]}px;
  margin-bottom: ${spacing[4]}px;
`;

const SpeedValue = styled.Text`
  color: ${colors.white};
  font-size: 48px;
  font-weight: ${fontWeight.bold};
`;

const SpeedUnit = styled.Text`
  color: ${colors.brand[400]};
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.semibold};
`;

const CoordinatesBox = styled.View`
  background-color: rgba(255, 255, 255, 0.05);
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: ${spacing[3]}px;
  margin-bottom: ${spacing[4]}px;
  width: 100%;
`;

const CoordText = styled.Text`
  color: ${colors.slate[300]};
  font-size: ${fontSize.xs}px;
  font-family: 'Courier New';
`;

const ControlButton = styled.TouchableOpacity`
  background-color: ${props =>
    props.isTracking ? colors.red[600] : colors.emerald[600]};
  width: 100%;
  padding: ${spacing[4]}px;
  border-radius: 12px;
  align-items: center;
  margin-bottom: ${spacing[3]}px;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

/* =======================
   MAIN COMPONENT
======================= */

const DriverTrackerScreen = () => {
  useKeepAwake();

  const { tripId = 'TRIP-DEMO-001' } = useLocalSearchParams();

  const [location, setLocation] = useState(INITIAL_COORDS);
  const [speed, setSpeed] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('🔴 Desconectado');
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef(null);
  const simInterval = useRef(null);

  /* =======================
     SOCKET.IO
  ======================= */

  useEffect(() => {
    socketRef.current = io(`${SOCKET_URL}/gps`, {
      transports: ['websocket'],
      reconnection: true,
      auth: {
        driverId: 'DRIVER-01',
        companyId: 'MACON-01'
      }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setStatus('🟢 Conectado');
      setIsLoading(false);

      socketRef.current.emit('driver-login', {
        tripId,
        driverId: 'DRIVER-01',
        startCoordinates: location
      });
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setStatus('🔴 Desconectado');
    });

    return () => {
      stopSimulation();
      socketRef.current?.disconnect();
    };
  }, []);

  /* =======================
     SIMULAÇÃO GPS
  ======================= */

  const startSimulation = () => {
    setIsTracking(true);

    let lat = location.latitude;
    let lng = location.longitude;

    simInterval.current = setInterval(() => {
      lat += 0.0002;
      lng += (Math.random() - 0.5) * 0.0001;

      const currentSpeed = 60 + Math.random() * 20;

      const newLocation = {
        latitude: lat,
        longitude: lng
      };

      setLocation(newLocation);
      setSpeed(currentSpeed);

      if (socketRef.current?.connected) {
        socketRef.current.emit('send-location', {
          tripId,
          driverId: 'DRIVER-01',
          ...newLocation,
          speed: currentSpeed
        });
      }
    }, 2000);
  };

  const stopSimulation = () => {
    setIsTracking(false);
    if (simInterval.current) clearInterval(simInterval.current);
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <OperatorGuard>
      <Container>
        <StatusBar barStyle="light-content" />

        <MapView
          style={styles.map}
          styleURL={MapView.StyleURL.Street}
          logoEnabled={false}
        >
          <Camera
            centerCoordinate={[location.longitude, location.latitude]}
            zoomLevel={14}
            animationDuration={500}
          />

          <MarkerView
            coordinate={[location.longitude, location.latitude]}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.brand[600],
                borderWidth: 2,
                borderColor: '#fff'
              }}
            />
          </MarkerView>
        </MapView>

        <HUD>
          <StatusContainer>
            <StatusIndicator>
              <StatusDot isConnected={isConnected} />
              <StatusText isConnected={isConnected}>
                {status}
              </StatusText>
            </StatusIndicator>
          </StatusContainer>

          <SpeedContainer>
            <SpeedValue>{speed.toFixed(0)}</SpeedValue>
            <SpeedUnit>km/h</SpeedUnit>
          </SpeedContainer>

          <CoordinatesBox>
            <CoordText>LAT: {location.latitude.toFixed(6)}</CoordText>
            <CoordText>LNG: {location.longitude.toFixed(6)}</CoordText>
          </CoordinatesBox>

          <ControlButton
            isTracking={isTracking}
            onPress={isTracking ? stopSimulation : startSimulation}
            disabled={!isConnected}
            style={{ opacity: !isConnected ? 0.5 : 1 }}
          >
            <ButtonText>
              {isTracking ? '⏹️ PARAR VIAGEM' : '▶️ INICIAR VIAGEM'}
            </ButtonText>
          </ControlButton>
        </HUD>

        {isLoading && (
          <LoadingOverlay>
            <ActivityIndicator size="large" color={colors.brand[600]} />
            <Text style={{ color: '#fff', marginTop: 16 }}>
              Conectando ao servidor...
            </Text>
          </LoadingOverlay>
        )}
      </Container>
    </OperatorGuard>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1
  }
});

export default DriverTrackerScreen;
