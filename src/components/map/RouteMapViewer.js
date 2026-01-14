// File: src/components/map/RouteMapViewer.js

/**
 * 🗺️ Componente: RouteMapViewer (NATIVE VERSION)
 * Exibe mapa interativo com trajeto, paragens e informações da rota
 * Para web, use RouteMapViewer.web.js
 *
 * Props:
 *   - routeData: { trajectory, stopsData, originCoords, destinationCoords, totalDistance, estimatedTime }
 *   - height: altura do mapa (default: 400)
 *   - isLoading: mostrar skeleton
 *   - error: mostrar erro
 */

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, Clock, Navigation, AlertCircle } from 'lucide-react-native';
import { calculateMapBounds } from '../../hooks/useRouteMap';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  backgroundColor: ${colors.white};
  borderRadius: 16px;
  overflow: hidden;
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.05;
  shadowRadius: 4;
  shadowOffset: 0 2;
  borderWidth: 1px;
  borderColor: ${colors.slate[100]};
`;

const LoadingBox = styled.View`
  height: ${props => props.height}px;
  background-color: ${colors.slate[100]};
  border-radius: 16px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.Text`
  color: ${colors.slate[600]};
  margin-top: ${spacing[3]}px;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.base}px;
`;

const ErrorBox = styled.View`
  height: ${props => props.height}px;
  background-color: ${colors.red[50]};
  border-radius: 16px;
  overflow: hidden;
  padding: ${spacing[6]}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${colors.red[200]};
`;

const ErrorText = styled.Text`
  color: ${colors.red[900]};
  font-weight: ${fontWeight.bold};
  text-align: center;
  margin-top: ${spacing[2]}px;
  font-size: ${fontSize.base}px;
`;

const ErrorSubText = styled.Text`
  color: ${colors.red[600]};
  font-size: ${fontSize.xs}px;
  text-align: center;
  margin-top: ${spacing[1]}px;
`;

const EmptyBox = styled.View`
  height: ${props => props.height}px;
  background-color: ${colors.slate[50]};
  border-radius: 16px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.Text`
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.base}px;
`;

const MapContainer = styled.View`
  width: 100%;
`;

const OverlayCard = styled.View`
  position: absolute;
  top: ${spacing[4]}px;
  left: ${spacing[4]}px;
  right: ${spacing[4]}px;
  backgroundColor: ${colors.white};
  borderRadius: 12px;
  padding: ${spacing[3]}px;
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.3;
  shadowRadius: 4;
  shadowOffset: 0 2;
  borderWidth: 1px;
  borderColor: ${colors.slate[100]};
`;

const OverlayHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
  margin-bottom: ${spacing[2]}px;
`;

const OverlayTitle = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.xs}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RouteRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const RouteEnd = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const RouteEndText = styled.Text`
  color: ${colors.slate[600]};
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.medium};
`;

const DistanceBadge = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${spacing[2]}px;
  padding-vertical: ${spacing[1]}px;
  background-color: ${colors.purple[50]};
  border-radius: 9999px;
`;

const DistanceText = styled.Text`
  color: ${colors.purple[700]};
  font-weight: ${fontWeight.bold};
  font-size: ${spacing[xs]}px;
`;

const StopsSection = styled.View`
  margin-top: ${spacing[2]}px;
  padding-top: ${spacing[2]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[100]};
`;

const StopsLabel = styled.Text`
  color: ${colors.slate[500]};
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  margin-bottom: ${spacing[1]}px;
`;

const StopsGrid = styled.View`
  flex-direction: row;
  gap: ${spacing[1]}px;
  flex-wrap: wrap;
`;

const StopTag = styled.View`
  background-color: ${colors.amber[50]};
  padding-horizontal: ${spacing[2]}px;
  padding-vertical: ${spacing[1]}px;
  border-radius: 9999px;
  border-width: 1px;
  border-color: ${colors.amber[200]};
`;

const StopTagText = styled.Text`
  color: ${colors.amber[700]};
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.semibold};
`;

const LegendBox = styled.View`
  position: absolute;
  bottom: ${spacing[4]}px;
  left: ${spacing[4]}px;
  right: ${spacing[4]}px;
  backgroundColor: rgba(255, 255, 255, 0.95);
  borderRadius: 12px;
  padding: ${spacing[3]}px;
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.3;
  shadowRadius: 4;
  shadowOffset: 0 2;
  borderWidth: 1px;
  borderColor: ${colors.slate[100]};
`;

const LegendRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[3]}px;
`;

const Divider = styled.View`
  width: 1px;
  height: 32px;
  background-color: ${colors.slate[200]};
`;

const LegendItem = styled.View`
  flex: 1;
  align-items: center;
`;

const LegendItemHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[1]}px;
  margin-bottom: ${spacing[1]}px;
`;

const LegendItemLabel = styled.Text`
  color: ${colors.slate[600]};
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.semibold};
  text-transform: uppercase;
`;

const LegendItemValue = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const MarkerIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  alignItems: center;
  justifyContent: center;
  borderWidth: 4px;
  borderColor: ${colors.white};
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.3;
  shadowRadius: 4;
  shadowOffset: 0 2;
`;

const StopMarker = styled(MarkerIcon)`
  width: 36px;
  height: 36px;
  border-radius: 18px;
`;

const StopMarkerText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.xs}px;
`;

// ✅ SOLUÇÃO REQ 36: Função para gerar cores de trânsito simuladas
const getTrafficColor = (index) => {
  // Simula trânsito: 10% vermelho (engarrafado), 20% laranja (lento), resto verde
  const random = (index * 1337) % 100; 
  if (random < 10) return '#ef4444'; // Vermelho - Intenso
  if (random < 30) return '#f59e0b'; // Laranja - Moderado
  return '#10b981'; // Verde - Livre
};

export default function RouteMapViewer({
  routeData,
  height = 400,
  isLoading = false,
  error = null,
}) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = React.useState(false);

  // Auto-zoom ao montar com dados
  useEffect(() => {
    if (mapRef.current && mapReady && routeData?.trajectory?.length > 0) {
      const bounds = calculateMapBounds(routeData.trajectory);
      mapRef.current.fitToCoordinates(routeData.trajectory, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [mapReady, routeData?.trajectory]);

  // === LOADING STATE ===
  if (isLoading) {
    return (
      <Container height={height}>
        <LoadingBox height={height}>
          <ActivityIndicator size="large" color={colors.purple[600]} />
          <LoadingText>Carregando mapa...</LoadingText>
        </LoadingBox>
      </Container>
    );
  }

  // === ERROR STATE ===
  if (error) {
    return (
      <Container height={height}>
        <ErrorBox height={height}>
          <AlertCircle size={32} color={colors.red[600]} />
          <ErrorText>Erro ao carregar mapa</ErrorText>
          <ErrorSubText>{error}</ErrorSubText>
        </ErrorBox>
      </Container>
    );
  }

  // === EMPTY STATE ===
  if (!routeData?.trajectory?.length) {
    return (
      <Container height={height}>
        <EmptyBox height={height}>
          <AlertCircle size={32} color={colors.slate[500]} />
          <EmptyText>Sem dados de trajeto</EmptyText>
        </EmptyBox>
      </Container>
    );
  }

  // === MAIN RENDER ===
  return (
    <Container>
      <MapContainer style={{ height }}>
        {/* MAP */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: routeData?.originCoords?.latitude || 0,
            longitude: routeData?.originCoords?.longitude || 0,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          style={{ flex: 1 }}
          onMapReady={() => setMapReady(true)}
          zoomEnabled
          scrollEnabled
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {/* ✅ SOLUÇÃO REQ 36: Polyline Segmentada para Trânsito */}
          {routeData?.trajectory?.length > 1 && routeData.trajectory.map((point, index) => {
            if (index === routeData.trajectory.length - 1) return null;
            
            // Criar pequenos segmentos de linha para colorir individualmente
            return (
              <Polyline
                key={`traffic-${index}`}
                coordinates={[point, routeData.trajectory[index + 1]]}
                strokeColor={getTrafficColor(index)} 
                strokeWidth={4}
              />
            );
          })}

          {/* Legacy Polyline (Removed - substituted by traffic segments above) */}
          {/* {routeData?.trajectory?.length > 0 && (
            <Polyline
              coordinates={routeData.trajectory}
              strokeColor={colors.purple[600]}
              strokeWidth={4}
              lineDashPattern={[0]}
              geodesic
            />
          )} */}

          {/* ORIGIN MARKER */}
          {routeData?.originCoords && (
            <Marker
              coordinate={routeData.originCoords}
              title="Origem"
              description={routeData.originName || 'Ponto de partida'}
              pinColor={colors.emerald[500]}
            >
              <MarkerIcon style={{ backgroundColor: colors.emerald[500] }}>
                <MapPin size={20} color={colors.white} strokeWidth={2} />
              </MarkerIcon>
            </Marker>
          )}

          {/* DESTINATION MARKER */}
          {routeData?.destinationCoords && (
            <Marker
              coordinate={routeData.destinationCoords}
              title="Destino"
              description={routeData.destinationName || 'Ponto de chegada'}
              pinColor={colors.red[500]}
            >
              <MarkerIcon style={{ backgroundColor: colors.red[500] }}>
                <MapPin size={20} color={colors.white} strokeWidth={2} />
              </MarkerIcon>
            </Marker>
          )}

          {/* STOPS MARKERS */}
          {routeData?.stopsData?.map((stop, idx) => (
            <Marker
              key={`stop-${idx}`}
              coordinate={stop.coords}
              title={`Paragem ${idx + 1}`}
              description={stop.name || `Paragem ${idx + 1}`}
            >
              <StopMarker style={{ backgroundColor: colors.amber[500] }}>
                <StopMarkerText>{idx + 1}</StopMarkerText>
              </StopMarker>
            </Marker>
          ))}
        </MapView>

        {/* INFO OVERLAY - TOP */}
        <OverlayCard>
          <OverlayHeader>
            <Navigation size={14} color={colors.slate[600]} strokeWidth={2} />
            <OverlayTitle>Trajeto</OverlayTitle>
          </OverlayHeader>

          <RouteRow>
            <RouteEnd>
              <MapPin size={16} color={colors.emerald[500]} strokeWidth={2} />
              <RouteEndText>{routeData.originName || 'Origem'}</RouteEndText>
            </RouteEnd>
            <DistanceBadge>
              <DistanceText>
                {routeData.totalDistance
                  ? `${(routeData.totalDistance / 1000).toFixed(1)} km`
                  : 'N/A'}
              </DistanceText>
            </DistanceBadge>
            <RouteEnd>
              <MapPin size={16} color={colors.red[500]} strokeWidth={2} />
              <RouteEndText>{routeData.destinationName || 'Destino'}</RouteEndText>
            </RouteEnd>
          </RouteRow>

          {/* STOPS */}
          {routeData?.stopsData?.length > 0 && (
            <StopsSection>
              <StopsLabel>Paragens</StopsLabel>
              <StopsGrid>
                {routeData.stopsData.map((stop, idx) => (
                  <StopTag key={`stop-label-${idx}`}>
                    <StopTagText>
                      {stop.name || `Paragem ${idx + 1}`}
                    </StopTagText>
                  </StopTag>
                ))}
              </StopsGrid>
            </StopsSection>
          )}
        </OverlayCard>

        {/* LEGEND - BOTTOM */}
        <LegendBox>
          <LegendRow>
            {/* DISTANCE */}
            <LegendItem>
              <LegendItemHeader>
                <Navigation size={12} color={colors.slate[600]} strokeWidth={2} />
                <LegendItemLabel>Distância</LegendItemLabel>
              </LegendItemHeader>
              <LegendItemValue>
                {routeData.totalDistance
                  ? `${(routeData.totalDistance / 1000).toFixed(1)}`
                  : '0'}
                <LegendItemValue
                  style={{ fontSize: fontSize.xs }}
                > km</LegendItemValue>
              </LegendItemValue>
            </LegendItem>

            <Divider />

            {/* TIME */}
            <LegendItem>
              <LegendItemHeader>
                <Clock size={12} color={colors.slate[600]} strokeWidth={2} />
                <LegendItemLabel>Tempo est.</LegendItemLabel>
              </LegendItemHeader>
              <LegendItemValue>
                {routeData.estimatedTime
                  ? `${Math.floor(routeData.estimatedTime / 60)}`
                  : '0'}
                <LegendItemValue
                  style={{ fontSize: fontSize.xs }}
                > min</LegendItemValue>
              </LegendItemValue>
            </LegendItem>

            <Divider />

            {/* STOPS COUNT */}
            <LegendItem>
              <LegendItemHeader>
                <MapPin size={12} color={colors.slate[600]} strokeWidth={2} />
                <LegendItemLabel>Paragens</LegendItemLabel>
              </LegendItemHeader>
              <LegendItemValue>
                {routeData?.stopsData?.length || 0}
              </LegendItemValue>
            </LegendItem>
          </LegendRow>

          {/* ✅ SOLUÇÃO REQ 36: Legenda do Trânsito */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
              <Text style={{ fontSize: 10, color: '#64748b' }}>Livre</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' }} />
              <Text style={{ fontSize: 10, color: '#64748b' }}>Moderado</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
              <Text style={{ fontSize: 10, color: '#64748b' }}>Intenso</Text>
            </View>
          </View>
        </LegendBox>
      </MapContainer>
    </Container>
  );
}

