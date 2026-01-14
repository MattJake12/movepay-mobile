/**
 * 🚌 Driver Tracker Screen
 * Rastreamento GPS em tempo real com Socket.io
 * ✅ MISSÃO 1: Realtime GPS com simulação integrada
 * 
 * Funcionalidades:
 * - Conexão Socket.io robusta
 * - Motor de simulação GPS (gera coordenadas falsas para teste)
 * - Envio de localização em tempo real
 * - Mapa interativo com marcador do ônibus
 * - HUD com velocidade e status
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router'; // ✅ Melhor para expo-router
import styled from 'styled-components/native';
import io from 'socket.io-client';
import { OperatorGuard } from '../../src/components/OperatorGuard';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// Configuração do Socket
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://movepay-api.onrender.com';

// Coordenadas iniciais (Luanda, Angola)
const INITIAL_COORDS = {
  latitude: -8.83833,
  longitude: 13.23444
};

// ===== STYLED COMPONENTS =====
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
  shadow-color: ${colors.slate[900]};
  shadow-opacity: 0.5;
  shadow-radius: 8px;
  shadow-offset: 0px 4px;
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
  margin-bottom: ${spacing[2]}px;
`;

const StatusDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${props => props.isConnected ? '#10b981' : '#ef4444'};
`;

const StatusText = styled.Text`
  color: ${props => props.isConnected ? colors.emerald[400] : colors.red[400]};
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.semibold};
  letter-spacing: 0.5px;
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
  font-variant: tabular-nums;
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
  margin-bottom: ${spacing[1]}px;
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
  letter-spacing: 1.5px;
`;

const TripInfoBox = styled.View`
  background-color: ${colors.brand[50]};
  border-width: 1px;
  border-color: ${colors.brand[200]};
  border-radius: 8px;
  padding: ${spacing[3]}px;
  width: 100%;
  margin-bottom: ${spacing[4]}px;
`;

const TripInfoText = styled.Text`
  color: ${colors.brand[600]};
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.semibold};
  margin-bottom: ${spacing[1]}px;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

// ===== MAIN COMPONENT =====
const DriverTrackerScreen = () => {
  useKeepAwake(); // Mantém a tela ligada
  const { tripId = 'TRIP-DEMO-001' } = useLocalSearchParams();

  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(INITIAL_COORDS);
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState('🔴 Desconectado');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef(null);
  const simulationInterval = useRef(null);
  const locationBuffer = useRef([]);

  // ============================================
  // 1️⃣ INICIALIZAÇÃO - Conexão Socket.io Robusta
  // ============================================
  useEffect(() => {
    console.log('🚌 [TRACKER] Iniciando rastreador...');

    // Conectar ao namespace /gps com configurações robustas
    socketRef.current = io(`${SOCKET_URL}/gps`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      auth: {
        token: 'simulated-driver-token',
        driverId: 'DRIVER-01',
        companyId: 'MACON-01'
      }
    });

    // Evento: Conectado
    socketRef.current.on('connect', () => {
      console.log('✅ [SOCKET] Conectado ao servidor GPS');
      setIsConnected(true);
      setStatus('🟢 Conectado ao Satélite');
      setIsLoading(false);

      // Login na sala da viagem
      socketRef.current.emit('driver-login', {
        tripId,
        driverId: 'DRIVER-01',
        companyId: 'MACON-01',
        startCoordinates: location
      });
    });

    // Evento: Desconectado
    socketRef.current.on('disconnect', () => {
      console.log('❌ [SOCKET] Desconectado');
      setIsConnected(false);
      setStatus('🔴 Desconectado');
    });

    // Evento: Erro de conexão
    socketRef.current.on('connect_error', (error) => {
      console.error('⚠️ [SOCKET] Erro:', error.message);
      setStatus(`⚠️ Erro: ${error.message}`);
    });

    // Evento: Confirmação do servidor
    socketRef.current.on('location-received', (data) => {
      console.log('📡 [ACK] Localização recebida pelo servidor:', data);
    });

    return () => {
      stopSimulation();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ============================================
  // 2️⃣ SIMULAÇÃO GPS - Motor de Movimento
  // ============================================
  const startSimulation = () => {
    console.log('🎬 [SIM] Iniciando simulação de movimento...');
    setIsTracking(true);

    let lat = location.latitude;
    let lng = location.longitude;
    let currentSpeed = 60;
    let counter = 0;

    simulationInterval.current = setInterval(() => {
      // Simula movimento contínuo para o NORTE (latitude aumenta)
      lat += 0.0002; // ~20 metros por atualização

      // Simula variação realista de velocidade (60-80 km/h)
      currentSpeed = 60 + Math.random() * 20;

      // Se a cada 5 ciclos, simula pequenos desvios (realismo)
      if (counter % 5 === 0) {
        lng += (Math.random() - 0.5) * 0.0001;
      }

      const newLocation = {
        latitude: lat,
        longitude: lng,
        speed: parseFloat(currentSpeed.toFixed(1)),
        heading: 0, // Direção Norte
        accuracy: 5, // 5 metros
        altitude: 10,
        timestamp: new Date().toISOString()
      };

      setLocation(newLocation);
      setSpeed(currentSpeed);
      counter++;

      // 📡 ENVIA PARA O BACKEND A CADA 2 SEGUNDOS
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send-location', {
          ...newLocation,
          tripId,
          driverId: 'DRIVER-01'
        });

        // Buffer para análise local
        locationBuffer.current.push(newLocation);
        if (locationBuffer.current.length > 100) {
          locationBuffer.current.shift(); // Manter últimas 100 localizações
        }
      }
    }, 2000); // Atualiza a cada 2 segundos
  };

  const stopSimulation = () => {
    console.log('⏹️ [SIM] Parando simulação...');
    setIsTracking(false);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }
  };

  // ============================================
  // 3️⃣ RENDER
  // ============================================
  return (
    <OperatorGuard>
    <Container>
      <StatusBar barStyle="light-content" backgroundColor={colors.slate[900]} />

      {/* MAPA */}
      <MapView
        provider="google"
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || INITIAL_COORDS.latitude,
          longitude: location?.longitude || INITIAL_COORDS.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
        region={{
          latitude: location?.latitude || INITIAL_COORDS.latitude,
          longitude: location?.longitude || INITIAL_COORDS.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
        showsUserLocation={false}
        showsMyLocationButton={true}
        zoomEnabled
        scrollEnabled
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* MARCADOR DO ÔNIBUS */}
        <Marker
          coordinate={location}
          title="🚌 Meu Ônibus"
          description={`Viajando para ${tripId}`}
          pinColor={colors.emerald[500]}
        />
      </MapView>

      {/* HUD - Display de Informações */}
      <HUD>
        {/* Status de Conexão */}
        <StatusContainer>
          <StatusIndicator>
            <StatusDot isConnected={isConnected} />
            <StatusText isConnected={isConnected}>{status}</StatusText>
          </StatusIndicator>
        </StatusContainer>

        {/* Informações da Viagem */}
        <TripInfoBox>
          <TripInfoText>ID da Viagem: {tripId}</TripInfoText>
          <TripInfoText>Motorista: DRIVER-01</TripInfoText>
          <TripInfoText>Operadora: MACON-01</TripInfoText>
        </TripInfoBox>

        {/* Velocidade */}
        <SpeedContainer>
          <SpeedValue>{speed.toFixed(0)}</SpeedValue>
          <SpeedUnit>km/h</SpeedUnit>
        </SpeedContainer>

        {/* Coordenadas Precisas */}
        <CoordinatesBox>
          <CoordText>LAT: {location.latitude.toFixed(6)}</CoordText>
          <CoordText>LNG: {location.longitude.toFixed(6)}</CoordText>
          <CoordText>
            {isTracking ? '📡 Enviando localização ao servidor' : '⏸️ Rastreamento pausado'}
          </CoordText>
        </CoordinatesBox>

        {/* Botão de Controle Principal */}
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

        {/* Status Extra */}
        <Text style={{ color: colors.slate[400], fontSize: fontSize.xs }}>
          {isConnected ? '✅ Pronto para transmitir' : '⏳ Conectando...'}
        </Text>
      </HUD>

      {/* Loading Overlay */}
      {isLoading && (
        <LoadingOverlay>
          <ActivityIndicator size="large" color={colors.brand[600]} />
          <Text
            style={{
              color: colors.white,
              marginTop: spacing[4],
              fontSize: fontSize.base
            }}
          >
            Conectando ao satélite...
          </Text>
        </LoadingOverlay>
      )}
    </Container>
    </OperatorGuard>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default DriverTrackerScreen;


