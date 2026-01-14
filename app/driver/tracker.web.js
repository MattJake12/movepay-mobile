// File: app/driver/tracker.web.js

/**
 * 🚗 DRIVER TRACKER - WEB VERSION
 * Fallback web-safe para o rastreador de driver
 */

import React, { useEffect, useState, useRef } from 'react';
import { Alert, StatusBar, ScrollView, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';
import { OperatorGuard } from '../../src/components/OperatorGuard';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[900]};
`;

const WebWarning = styled.View`
  background-color: ${colors.orange[500]};
  padding: 12px;
  align-items: center;
`;

const WebWarningText = styled.Text`
  color: ${colors.white};
  font-size: 12px;
  font-weight: ${fontWeight.semibold};
`;

const MapPlaceholder = styled.View`
  height: 250px;
  background-color: ${colors.slate[800]};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[700]};
  justify-content: center;
  align-items: center;
`;

const PlaceholderText = styled.Text`
  color: ${colors.slate[500]};
  font-size: 14px;
`;

const HudTop = styled.View`
  flex-direction: row;
  padding: 12px;
  gap: 8px;
  background-color: ${colors.slate[800]};
`;

const HudCard = styled.View`
  flex: 1;
  background-color: ${colors.slate[700]};
  padding: 12px;
  border-radius: 8px;
  align-items: center;
`;

const HudLabel = styled.Text`
  color: ${colors.slate[500]};
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  margin-bottom: 4px;
`;

const HudValue = styled.Text`
  color: ${props => props.speedHigh ? '#ff4444' : props.isTracking ? '#00ff00' : '#ff4444'};
  font-size: 18px;
  font-weight: ${fontWeight.bold};
`;

const HudUnit = styled.Text`
  color: ${colors.slate[600]};
  font-size: 10px;
  margin-top: 2px;
`;

const Controls = styled.View`
  padding: 12px;
  background-color: ${colors.slate[800]};
`;

const Button = styled.Pressable`
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  background-color: ${props => props.active ? '#00ff00' : '#ff4444'};
`;

const ButtonText = styled.Text`
  font-size: 14px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const AlertsList = styled(ScrollView)`
  flex: 1;
  padding: 12px;
`;

const AlertItem = styled.View`
  background-color: ${colors.slate[700]};
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left-width: 3px;
  border-left-color: ${props => props.critical ? '#ff0000' : colors.orange[500]};
  background-color: ${props => props.critical ? 'rgba(77, 34, 34, 1)' : colors.slate[700]};
`;

const AlertText = styled.Text`
  color: ${colors.white};
  font-size: 12px;
`;

export default function DriverTrackerWebScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [heading, setHeading] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);

  const headingToDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return directions[idx];
  };

  const startTracking = async () => {
    try {
      // Em web, usar Geolocation API
      if (navigator.geolocation) {
        setIsTracking(true);
        setConnectionStatus('Rastreando');
        
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, heading, altitude } = position.coords;
            setLocation({ latitude, longitude });
            setSpeed((speed || 0) * 3.6); // m/s para km/h
            setHeading(heading || 0);
            setAltitude(altitude || 0);
          },
          (error) => {
            Alert.alert('Erro', `Erro ao obter localização: ${error.message}`);
            setIsTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        Alert.alert('Erro', 'Geolocalização não suportada neste navegador');
      }
    } catch (error) {
      Alert.alert('Erro', `Erro: ${error.message}`);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    setConnectionStatus('Desconectado');
    setLocation(null);
  };

  return (
    <OperatorGuard>
    <Container>
      <StatusBar barStyle="light-content" backgroundColor={colors.slate[900]} />

      {/* Aviso web */}
      <WebWarning>
        <WebWarningText>⚠️ Versão Web - Funcionalidades limitadas. Use app nativo para rastreamento completo.</WebWarningText>
      </WebWarning>

      {/* Mapa Placeholder */}
      <MapPlaceholder>
        <PlaceholderText>
          {location 
            ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`
            : 'Mapa não disponível em web'}
        </PlaceholderText>
      </MapPlaceholder>

      {/* HUD Superior */}
      <HudTop>
        <HudCard>
          <HudLabel>VELOCIDADE</HudLabel>
          <HudValue speedHigh={speed > 100}>{speed.toFixed(1)}</HudValue>
          <HudUnit>km/h</HudUnit>
        </HudCard>

        <HudCard>
          <HudLabel>ALTITUDE</HudLabel>
          <HudValue>{altitude.toFixed(0)}</HudValue>
          <HudUnit>m</HudUnit>
        </HudCard>

        <HudCard>
          <HudLabel>DIREÇÃO</HudLabel>
          <HudValue>{headingToDirection(heading)}</HudValue>
          <HudUnit>{heading.toFixed(0)}°</HudUnit>
        </HudCard>

        <HudCard>
          <HudLabel>STATUS</HudLabel>
          <HudValue isTracking={isTracking}>{isTracking ? '●' : '○'}</HudValue>
          <HudUnit>{connectionStatus}</HudUnit>
        </HudCard>
      </HudTop>

      {/* Botões de Controle */}
      <Controls>
        <Button active={isTracking} onPress={isTracking ? stopTracking : startTracking}>
          <ButtonText>
            {isTracking ? '⊙ PARANDO RASTREAMENTO' : '● INICIAR RASTREAMENTO'}
          </ButtonText>
        </Button>
      </Controls>

      {/* Alertas */}
      {alerts.length > 0 && (
        <AlertsList>
          {alerts.map((alert, idx) => (
            <AlertItem key={idx} critical={alert.severity === 'CRITICAL'}>
              <AlertText>{alert.message}</AlertText>
            </AlertItem>
          ))}
        </AlertsList>
      )}
    </Container>
    </OperatorGuard>
  );
}

const styles = StyleSheet.create({});
