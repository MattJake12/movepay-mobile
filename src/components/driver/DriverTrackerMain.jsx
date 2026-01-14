// mobile/src/components/driver/DriverTrackerMain.jsx

/**
 * 🚗 DRIVER TRACKER - MAIN COMPONENT
 * 
 * Interface principal para motorista rastrear viagem
 * - Mapa em tempo real
 * - Validação de bilhetes (QR)
 * - Status da viagem
 * - Lista de passageiros
 * - Chat de comunicação
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import styled from 'styled-components/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useDriverTracking } from '../../hooks/useDriverTracking';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';
import QRScannerModal from './QRScannerModal';
import PassengersList from './PassengersList';
import TripStatusCard from './TripStatusCard';
import ChatBubble from './ChatBubble';

const DriverTrackerMain = ({ tripId, tripData = null, onTripEnd = null }) => {
  const { user } = useAuth();
  const { location, isTracking, stats, startTracking, stopTracking, updateTripStatus } =
    useDriverTracking(tripId, true);

  const [activeTab, setActiveTab] = useState('map'); // map, passengers, chat
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [tripStatus, setTripStatus] = useState('SCHEDULED');
  const [showMenu, setShowMenu] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -8.8383, // Luanda
    longitude: 13.2344,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  });

  /**
   * Efeito: Atualizar região do mapa quando localização mudar
   */
  useEffect(() => {
    if (location) {
      setMapRegion(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }));
    }
  }, [location]);

  /**
   * Iniciar embarque
   */
  const handleStartBoarding = () => {
    Alert.alert(
      'Iniciar Embarque?',
      'Todos os passageiros devem embarcar e validar seus bilhetes.',
      [
        {
          text: 'Cancelar',
          onPress: () => {}
        },
        {
          text: 'Iniciar',
          onPress: () => {
            setTripStatus('BOARDING');
            updateTripStatus('BOARDING');
          }
        }
      ]
    );
  };

  /**
   * Iniciar viagem
   */
  const handleStartTrip = () => {
    Alert.alert(
      'Iniciar Viagem?',
      'Todos os passageiros embarcaram e validaram seus bilhetes?',
      [
        {
          text: 'Cancelar',
          onPress: () => {}
        },
        {
          text: 'Começar Viagem',
          onPress: () => {
            setTripStatus('ON_ROUTE');
            updateTripStatus('ON_ROUTE');
          }
        }
      ]
    );
  };

  /**
   * Finalizar viagem
   */
  const handleCompleteTrip = () => {
    Alert.alert(
      'Finalizar Viagem?',
      'Certifique-se que todos os passageiros desembarcaram.',
      [
        {
          text: 'Cancelar',
          onPress: () => {}
        },
        {
          text: 'Finalizar',
          onPress: () => {
            setTripStatus('COMPLETED');
            updateTripStatus('COMPLETED');
            stopTracking();
            if (onTripEnd) {
              onTripEnd({ tripId, status: 'COMPLETED' });
            }
          }
        }
      ]
    );
  };

  /**
   * Cancelar viagem (emergência)
   */
  const handleCancelTrip = () => {
    Alert.alert(
      '⚠️ CANCELAR VIAGEM',
      'Esta ação vai cancelar a viagem para todos os passageiros.',
      [
        {
          text: 'Não, Continuar',
          onPress: () => {}
        },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => {
            setTripStatus('CANCELLED');
            updateTripStatus('CANCELLED');
            stopTracking();
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      SCHEDULED: colors.slate[400],
      BOARDING: '#FFA500',
      ON_ROUTE: '#00AA00',
      COMPLETED: '#00CC00',
      CANCELLED: '#FF0000'
    };
    return statusColors[status] || colors.slate[400];
  };

  const getStatusLabel = (status) => {
    const labels = {
      SCHEDULED: 'Agendado',
      BOARDING: 'Embarque',
      ON_ROUTE: 'Em Viagem',
      COMPLETED: 'Finalizada',
      CANCELLED: 'Cancelada'
    };
    return labels[status] || status;
  };

  return (
    <Container style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* HEADER */}
      <Header>
        <HeaderContent>
          <DriverInfo>
            <DriverName>{user?.name || 'Motorista'}</DriverName>
            <CompanyName>{user?.company?.name || 'Operadora'}</CompanyName>
          </DriverInfo>
          <StatusBadge backgroundColor={getStatusColor(tripStatus)}>
            <StatusText>{getStatusLabel(tripStatus)}</StatusText>
          </StatusBadge>
        </HeaderContent>
      </Header>

      {/* TABS */}
      <TabContainer>
        <Tab
          active={activeTab === 'map'}
          onPress={() => setActiveTab('map')}
        >
          <TabIcon>
            <MaterialIcons name="map" size={20} color={activeTab === 'map' ? colors.primary : colors.slate[500]} />
          </TabIcon>
          <TabLabel active={activeTab === 'map'}>Mapa</TabLabel>
        </Tab>

        <Tab
          active={activeTab === 'passengers'}
          onPress={() => setActiveTab('passengers')}
        >
          <TabIcon>
            <MaterialIcons name="people" size={20} color={activeTab === 'passengers' ? colors.primary : colors.slate[500]} />
          </TabIcon>
          <TabLabel active={activeTab === 'passengers'}>Passageiros</TabLabel>
        </Tab>

        <Tab
          active={activeTab === 'chat'}
          onPress={() => setActiveTab('chat')}
        >
          <TabIcon>
            <MaterialIcons name="chat" size={20} color={activeTab === 'chat' ? colors.primary : colors.slate[500]} />
          </TabIcon>
          <TabLabel active={activeTab === 'chat'}>Chat</TabLabel>
        </Tab>
      </TabContainer>

      {/* CONTENT */}
      <Content>
        {/* TAB: MAPA */}
        {activeTab === 'map' && (
          <MapSection>
            {location ? (
              <Map
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
              >
                {/* Marcador: Localização Atual */}
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude
                  }}
                  title="Você está aqui"
                  description={`Velocidade: ${location.speed} km/h`}
                >
                  <MarkerCircle>
                    <MarkerDot />
                  </MarkerCircle>
                </Marker>

                {/* Marcadores: Destinos */}
                {tripData?.stops && tripData.stops.map((stop, idx) => (
                  <Marker
                    key={idx}
                    coordinate={{
                      latitude: stop.latitude,
                      longitude: stop.longitude
                    }}
                    title={stop.name}
                  >
                    <StopMarker>
                      <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
                    </StopMarker>
                  </Marker>
                ))}
              </Map>
            ) : (
              <MapPlaceholder>
                <ActivityIndicator size="large" color={colors.primary} />
                <PlaceholderText>Obtendo localização...</PlaceholderText>
              </MapPlaceholder>
            )}

            {/* HUD (Heads-Up Display) */}
            <HUD>
              <HUDCard>
                <HUDLabel>Velocidade</HUDLabel>
                <HUDValue>{stats.speed}</HUDValue>
                <HUDUnit>km/h</HUDUnit>
              </HUDCard>

              <HUDCard>
                <HUDLabel>Distância</HUDLabel>
                <HUDValue>{stats.distance}</HUDValue>
                <HUDUnit>km</HUDUnit>
              </HUDCard>

              <HUDCard>
                <HUDLabel>Tempo</HUDLabel>
                <HUDValue>{stats.duration}</HUDValue>
                <HUDUnit>hh:mm:ss</HUDUnit>
              </HUDCard>

              <HUDCard>
                <HUDLabel>Precisão</HUDLabel>
                <HUDValue>{stats.accuracy}</HUDValue>
                <HUDUnit>m</HUDUnit>
              </HUDCard>
            </HUD>

            {/* CONTROLES */}
            <ControlsContainer>
              {tripStatus === 'SCHEDULED' && (
                <ActionButton success onPress={handleStartBoarding}>
                  <ButtonText>🚪 Iniciar Embarque</ButtonText>
                </ActionButton>
              )}

              {tripStatus === 'BOARDING' && (
                <>
                  <ActionButton success onPress={handleStartTrip}>
                    <ButtonText>▶️ Começar Viagem</ButtonText>
                  </ActionButton>
                  <ActionButton secondary onPress={() => setShowQRScanner(true)}>
                    <ButtonText>📱 Escanear QR</ButtonText>
                  </ActionButton>
                </>
              )}

              {tripStatus === 'ON_ROUTE' && (
                <ActionButton success onPress={handleCompleteTrip}>
                  <ButtonText>✓ Finalizar Viagem</ButtonText>
                </ActionButton>
              )}

              {(tripStatus === 'SCHEDULED' || tripStatus === 'BOARDING' || tripStatus === 'ON_ROUTE') && (
                <ActionButton danger onPress={handleCancelTrip}>
                  <ButtonText>✕ Cancelar Viagem</ButtonText>
                </ActionButton>
              )}
            </ControlsContainer>
          </MapSection>
        )}

        {/* TAB: PASSAGEIROS */}
        {activeTab === 'passengers' && (
          <PassengersSection>
            <PassengersList
              tripId={tripId}
              onOpenQRScanner={() => setShowQRScanner(true)}
            />
          </PassengersSection>
        )}

        {/* TAB: CHAT */}
        {activeTab === 'chat' && (
          <ChatSection>
            <ChatBubble
              tripId={tripId}
              senderType="DRIVER"
              senderName={user?.name || 'Motorista'}
            />
          </ChatSection>
        )}
      </Content>

      {/* MODAL: QR SCANNER */}
      {showQRScanner && (
        <QRScannerModal
          tripId={tripId}
          onClose={() => setShowQRScanner(false)}
          onTicketValidated={() => {
            // Feedback visual
            Alert.alert('✅ Bilhete Validado!', 'Passageiro pode embarcar');
          }}
        />
      )}
    </Container>
  );
};

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;

const Header = styled.View`
  background-color: ${colors.primary};
  padding: ${spacing.lg}px ${spacing.md}px;
  gap: ${spacing.sm}px;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DriverInfo = styled.View`
  gap: ${spacing.xs}px;
`;

const DriverName = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.white};
`;

const CompanyName = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[200]};
`;

const StatusBadge = styled.View`
  background-color: ${props => props.backgroundColor};
  padding-horizontal: ${spacing.md}px;
  padding-vertical: ${spacing.sm}px;
  border-radius: 20px;
`;

const StatusText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${colors.slate[100]};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[300]};
`;

const Tab = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
  padding: ${spacing.md}px;
  border-bottom-width: ${props => props.active ? 3 : 0}px;
  border-bottom-color: ${colors.primary};
`;

const TabIcon = styled.View``;

const TabLabel = styled.Text`
  font-weight: ${props => props.active ? fontWeight.bold : fontWeight.semibold};
  color: ${props => props.active ? colors.primary : colors.slate[500]};
  font-size: ${fontSize.sm}px;
`;

const Content = styled.View`
  flex: 1;
`;

const MapSection = styled.View`
  flex: 1;
  position: relative;
`;

const Map = styled(MapView)`
  flex: 1;
`;

const MapPlaceholder = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${colors.slate[100]};
`;

const PlaceholderText = styled.Text`
  margin-top: ${spacing.md}px;
  color: ${colors.slate[600]};
  font-size: ${fontSize.md}px;
`;

const MarkerCircle = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${colors.primary};
  border-width: 3px;
  border-color: ${colors.white};
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.25);
`;

const MarkerDot = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${colors.white};
`;

const StopMarker = styled.View`
  width: 40px;
  height: 40px;
  background-color: ${colors.white};
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  border-width: 2px;
  border-color: #FF6B6B;
`;

const HUD = styled.View`
  position: absolute;
  top: ${spacing.md}px;
  left: ${spacing.md}px;
  right: ${spacing.md}px;
  flex-direction: row;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: ${spacing.md}px;
  gap: ${spacing.sm}px;
`;

const HUDCard = styled.View`
  flex: 1;
  align-items: center;
  gap: ${spacing.xs}px;
`;

const HUDLabel = styled.Text`
  color: ${colors.slate[400]};
  font-size: 10px;
  font-weight: ${fontWeight.semibold};
`;

const HUDValue = styled.Text`
  color: #00ff00;
  font-size: 16px;
  font-weight: ${fontWeight.bold};
`;

const HUDUnit = styled.Text`
  color: ${colors.slate[600]};
  font-size: 9px;
`;

const ControlsContainer = styled.View`
  position: absolute;
  bottom: ${spacing.md}px;
  left: ${spacing.md}px;
  right: ${spacing.md}px;
  gap: ${spacing.sm}px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: 8px;
  background-color: ${props =>
    props.success ? '#00AA00' :
    props.danger ? '#FF0000' :
    props.secondary ? colors.primary :
    colors.slate[400]};
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.md}px;
`;

const PassengersSection = styled.View`
  flex: 1;
`;

const ChatSection = styled.View`
  flex: 1;
`;

export default DriverTrackerMain;
