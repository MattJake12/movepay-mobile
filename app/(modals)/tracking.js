import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bus, MapPin, Navigation, Clock } from 'lucide-react-native';
import { useRouteMap, calculateMapBounds } from '../../src/hooks/useRouteMap';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  position: absolute;
  top: 50px;
  left: 20px;
  z-index: 10;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.white};
  align-items: center;
  justify-content: center;
  ${shadows.md}
`;

const MapContainer = styled.View`
  flex: 1;
  background-color: #e5e5e5;
`;

const InfoCard = styled.View`
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  background-color: ${colors.white};
  padding: ${spacing[5]}px;
  border-radius: 20px;
  ${shadows.lg}
`;

const RouteInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[4]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
  padding-bottom: ${spacing[4]}px;
`;

const LocationText = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const StatusBadge = styled.View`
  background-color: ${colors.emerald[100]};
  padding: 4px 10px;
  border-radius: 8px;
`;

const StatusText = styled.Text`
  color: ${colors.emerald[700]};
  font-size: 12px;
  font-weight: ${fontWeight.bold};
`;

const DetailRow = styled.View`
  flex-direction: row;
  gap: ${spacing[4]}px;
`;

const DetailItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const DetailText = styled.Text`
  color: ${colors.slate[600]};
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.medium};
`;

const DriverInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${spacing[4]}px;
  padding-top: ${spacing[4]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[100]};
`;

const DriverAvatar = styled.View`
  width: 40px;
  height: 40px;
  background-color: ${colors.slate[200]};
  border-radius: 20px;
  margin-right: ${spacing[3]}px;
  align-items: center;
  justify-content: center;
`;

const DriverName = styled.Text`
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[800]};
`;

const BusPlate = styled.Text`
  color: ${colors.slate[500]};
  font-size: 12px;
`;

export default function TrackingScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const mapRef = useRef(null);

  // 1. Dados da Rota (Estáticos)
  const { data: routeData, isLoading } = useRouteMap(tripId);

  // 2. Dados do Autocarro (Ao Vivo - Simulado por enquanto)
  const [busLocation, setBusLocation] = useState(null);

  // Simular movimento do autocarro
  useEffect(() => {
    if (!routeData?.trajectory || routeData.trajectory.length < 2) return;

    // Começa na origem
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.005; // Movimento mais suave (0.5% por tick)
      if (progress > 1) progress = 0;

      // LÓGICA DE INTERPOLAÇÃO MULTI-PONTO
      // Permite que o autocarro siga a curva da estrada (trajectory)
      // em vez de uma linha reta que atravessa o mar.
      
      const path = routeData.trajectory;
      const totalSegments = path.length - 1;
      
      // Em qual segmento estamos? (ex: 0 a 8)
      const exactIndex = progress * totalSegments;
      const currentIndex = Math.floor(exactIndex);
      const nextIndex = Math.min(currentIndex + 1, totalSegments);
      
      // Progresso dentro deste segmento específico (0 a 1)
      const segmentProgress = exactIndex - currentIndex;

      const start = path[currentIndex];
      const end = path[nextIndex];

      if (start && end) {
        setBusLocation({
          latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
          longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
          // Rotação simplificada (apontar para o próximo ponto)
          heading: Math.atan2(end.longitude - start.longitude, end.latitude - start.latitude) * (180 / Math.PI)
        });
      }
    }, 50); // 50ms para 60fps suave

    return () => clearInterval(interval);
  }, [routeData]);

  // Centralizar mapa ao carregar
  useEffect(() => {
    if (routeData && mapRef.current) {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = calculateMapBounds([
        routeData.originCoords,
        routeData.destinationCoords
      ]);
      
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: latitudeDelta * 1.2, // Zoom out um pouco
        longitudeDelta: longitudeDelta * 1.2,
      }, 1000);
    }
  }, [routeData]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
        <Text style={{marginTop: 10, color: colors.slate[500]}}>Carregando rota...</Text>
      </View>
    );
  }

  if (!routeData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Navigation size={48} color={colors.slate[300]} />
        <Text style={{
          marginTop: 20, 
          fontSize: 16, 
          fontWeight: 'bold', 
          color: colors.slate[800],
          textAlign: 'center'
        }}>
          Rota não disponível
        </Text>
        <Text style={{
          marginTop: 8, 
          color: colors.slate[500], 
          textAlign: 'center'
        }}>
          Não foi possível carregar os dados de rastreamento desta viagem.
          Verifique sua conexão ou tente novamente mais tarde.
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{
            marginTop: 30, 
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: colors.slate[100],
            borderRadius: 8
          }}>
          <Text style={{color: colors.slate[700], fontWeight: 'bold'}}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Container>
      <StatusBar barStyle="dark-content" />
      
      {/* Botão Voltar Flutuante */}
      <Header>
        <BackButton onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.slate[900]} />
        </BackButton>
      </Header>

      <MapContainer>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: routeData.originCoords.lat,
            longitude: routeData.originCoords.lng,
            latitudeDelta: 5,
            longitudeDelta: 5,
          }}
        >
          {/* Rota (Linha Azul) */}
          <Polyline
            coordinates={routeData.trajectory}
            strokeColor={colors.brand[600]}
            strokeWidth={4}
          />

          {/* Marcador Origem */}
          <Marker coordinate={{ latitude: routeData.originCoords.lat, longitude: routeData.originCoords.lng }}>
            <View style={{ backgroundColor: colors.white, padding: 4, borderRadius: 20, borderWidth: 2, borderColor: colors.brand[600] }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand[600] }} />
            </View>
          </Marker>

          {/* Marcador Destino */}
          <Marker coordinate={{ latitude: routeData.destinationCoords.lat, longitude: routeData.destinationCoords.lng }}>
            <MapPin size={32} color={colors.red[500]} fill={colors.white} />
          </Marker>

          {/* 🚍 AUTOCARRO EM MOVIMENTO */}
          {busLocation && (
            <Marker coordinate={busLocation}>
              <View style={{ 
                backgroundColor: colors.brand[600], 
                padding: 8, 
                borderRadius: 20,
                borderWidth: 2,
                borderColor: colors.white,
                elevation: 5
              }}>
                <Bus size={20} color={colors.white} />
              </View>
            </Marker>
          )}
        </MapView>
      </MapContainer>

      {/* Cartão de Informações Inferior */}
      <InfoCard>
        <RouteInfo>
          <View>
            <LocationText>{routeData.origin} ➔ {routeData.destination}</LocationText>
            <StatusText style={{color: colors.slate[500], marginTop: 2}}>Viagem em andamento</StatusText>
          </View>
          <StatusBadge>
            <StatusText>NO HORÁRIO</StatusText>
          </StatusBadge>
        </RouteInfo>

        <DetailRow>
          <DetailItem>
            <Navigation size={18} color={colors.brand[600]} />
            <DetailText>{routeData.totalDistance} km restantes</DetailText>
          </DetailItem>
          
          <DetailItem>
            <Clock size={18} color={colors.orange[500]} />
            <DetailText>Chegada: {routeData.estimatedArrival || '18:30'}</DetailText>
          </DetailItem>
        </DetailRow>

        <DriverInfo>
          <DriverAvatar>
            <Text>MD</Text>
          </DriverAvatar>
          <View>
            <DriverName>Motorista da Macon</DriverName>
            <BusPlate>Volvo B12 • LD-22-44-XX</BusPlate>
          </View>
        </DriverInfo>
      </InfoCard>
    </Container>
  );
}
