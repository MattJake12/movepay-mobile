import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StatusBar
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';

import MapView, {
  MarkerView,
  ShapeSource,
  LineLayer,
  Camera
} from '@maplibre/maplibre-react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Navigation, Clock } from 'lucide-react-native';

import { useRouteMap } from '../../src/hooks/useRouteMap';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

/* =======================
   STYLED COMPONENTS
======================= */

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

/* =======================
   SCREEN
======================= */

export default function TrackingScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();

  const mapRef = useRef(null);

  const { data: routeData, isLoading } = useRouteMap(tripId);

  const [busLocation, setBusLocation] = useState(null);
  const [trackingError, setTrackingError] = useState(null);

  /* =======================
     SIMULA MOVIMENTO
  ======================= */

  useEffect(() => {
    if (!routeData?.trajectory || routeData.trajectory.length < 2) {
      setTrackingError('Dados de rota insuficientes.');
      return;
    }

    setTrackingError(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.003;
      if (progress > 1) progress = 0;

      const path = routeData.trajectory;
      const max = path.length - 1;
      const idx = progress * max;

      const a = path[Math.floor(idx)];
      const b = path[Math.min(Math.floor(idx) + 1, max)];

      if (!a || !b) return;

      const lat = a.latitude + (b.latitude - a.latitude) * (idx % 1);
      const lng = a.longitude + (b.longitude - a.longitude) * (idx % 1);

      const heading =
        Math.atan2(b.longitude - a.longitude, b.latitude - a.latitude) *
        (180 / Math.PI);

      setBusLocation({ latitude: lat, longitude: lng, heading });
    }, 50);

    return () => clearInterval(interval);
  }, [routeData]);

  /* =======================
     LOADING / ERROR
  ======================= */

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
        <Text style={{ marginTop: 10, color: colors.slate[500] }}>
          Carregando rota...
        </Text>
      </View>
    );
  }

  if (!routeData || trackingError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Navigation size={48} color={colors.slate[300]} />
        <Text style={{ marginTop: 16, fontWeight: 'bold' }}>
          {trackingError || 'Rota indisponível'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <Container>
      <StatusBar barStyle="dark-content" />

      <Header>
        <BackButton onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.slate[900]} />
        </BackButton>
      </Header>

      <MapContainer>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          styleURL={MapView.StyleURL.Street}
          logoEnabled={false}
        >
          <Camera
            zoomLevel={12}
            centerCoordinate={[
              routeData.originCoords.lng,
              routeData.originCoords.lat
            ]}
            animationDuration={1000}
          />

          <ShapeSource
            id="route"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeData.trajectory.map(p => [
                  p.longitude,
                  p.latitude
                ])
              }
            }}
          >
            <LineLayer
              id="routeLine"
              style={{
                lineColor: colors.brand[600],
                lineWidth: 4
              }}
            />
          </ShapeSource>

          {/* Origem */}
          <MarkerView
            coordinate={[
              routeData.originCoords.lng,
              routeData.originCoords.lat
            ]}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.emerald[500]
              }}
            />
          </MarkerView>

          {/* Destino */}
          <MarkerView
            coordinate={[
              routeData.destinationCoords.lng,
              routeData.destinationCoords.lat
            ]}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.red[500]
              }}
            />
          </MarkerView>

          {/* Autocarro */}
          {busLocation && (
            <MarkerView
              coordinate={[busLocation.longitude, busLocation.latitude]}
              rotation={busLocation.heading}
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
          )}
        </MapView>
      </MapContainer>

      <InfoCard>
        <RouteInfo>
          <View>
            <LocationText>
              {routeData.origin} ➔ {routeData.destination}
            </LocationText>
            <StatusText style={{ color: colors.slate[500], marginTop: 4 }}>
              Viagem em andamento
            </StatusText>
          </View>
          <StatusBadge>
            <StatusText>NO HORÁRIO</StatusText>
          </StatusBadge>
        </RouteInfo>

        <DetailRow>
          <DetailItem>
            <Navigation size={18} color={colors.brand[600]} />
            <DetailText>{routeData.totalDistance} km</DetailText>
          </DetailItem>

          <DetailItem>
            <Clock size={18} color={colors.orange[500]} />
            <DetailText>
              Chegada: {routeData.estimatedArrival || '18:30'}
            </DetailText>
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
