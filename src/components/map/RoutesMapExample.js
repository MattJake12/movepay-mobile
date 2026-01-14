// File: src/components/map/RoutesMapExample.js

/**
 * 📱 Exemplo de Uso: Mapa Interativo
 * Copie este arquivo para referência ao implementar em outras telas
 */

import React from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useRouteMap } from '../hooks/useRouteMap';
import RouteMapViewer, { RouteStopsList } from '../components/map/RouteMapViewer';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const PageContainer = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;

const PageHeader = styled.View`
  padding: ${spacing[6]}px;
  padding-bottom: 0px;
`;

const PageTitle = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const PageSubtitle = styled.Text`
  color: ${colors.slate[500]};
  margin-top: ${spacing[1]}px;
  font-size: ${fontSize.base}px;
`;

const MapSection = styled.View`
  padding: ${spacing[6]}px;
`;

const InfoSection = styled.View`
  padding-left: ${spacing[6]}px;
  padding-right: ${spacing[6]}px;
  padding-bottom: ${spacing[6]}px;
`;

const InfoText = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[600]};
  font-weight: ${fontWeight.semibold};
  margin-bottom: ${spacing[2]}px;
`;

const LoadingBox = styled.View`
  height: 320px;
  background-color: ${colors.slate[100]};
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const TripCardContainer = styled.View`
  width: 288px;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  marginRight: ${spacing[4]}px;
  backgroundColor: ${colors.white};
  borderWidth: 1px;
  borderColor: ${colors.slate[100]};
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.05;
  shadowRadius: 2;
  shadowOffset: 0 1;
`;

const FallbackContainer = styled.View`
  flex: 1;
  background-color: ${colors.slate[50]};
  padding: ${spacing[6]}px;
  align-items: center;
  justify-content: center;
`;

const MapListWrapper = styled.View`
  margin-top: ${spacing[4]}px;
`;

/**
 * EXEMPLO 1: Mostrar mapa em detalhe de viagem
 */
export function RoutesMapExample1() {
  const tripId = 1; // ID da viagem

  const { data: mapData, isLoading, error } = useRouteMap(tripId);

  return (
    <PageContainer>
      <ScrollView>
        {/* Título */}
        <PageHeader>
          <PageTitle>Trajeto da Viagem</PageTitle>
          <PageSubtitle>Veja o mapa completo com todas as paragens</PageSubtitle>
        </PageHeader>

        {/* Mapa Interativo */}
        <MapSection>
          <RouteMapViewer
            routeData={mapData}
            height={400}
            isLoading={isLoading}
            error={error}
          />
        </MapSection>

        {/* Informações adicionais */}
        {mapData && (
          <InfoSection>
            <InfoText>
              Total: {mapData.totalDistance} km em {mapData.estimatedTime}
            </InfoText>
          </InfoSection>
        )}
      </ScrollView>
    </PageContainer>
  );
}

/**
 * EXEMPLO 2: Listar paragens sem mapa (fallback)
 */
export function RoutesMapExample2() {
  const tripId = 2;

  const { data: mapData, isLoading, error } = useRouteMap(tripId);

  return (
    <FallbackContainer>
      <PageTitle>Paragens</PageTitle>
      <RouteStopsList routeData={mapData} isLoading={isLoading} error={error} />
    </FallbackContainer>
  );
}

/**
 * EXEMPLO 3: Modal com mapa (como em ticket-detail.js)
 */
export function RoutesMapExample3() {
  const tripId = 3;

  const { data: mapData, isLoading, error } = useRouteMap(tripId);

  if (isLoading) {
    return (
      <LoadingBox>
        <ActivityIndicator size="large" color={colors.purple[600]} />
      </LoadingBox>
    );
  }

  if (error) {
    // Mostrar fallback com lista
    return <RouteStopsList routeData={mapData} error={error} />;
  }

  return (
    <>
      {/* Mapa + Info */}
      <RouteMapViewer routeData={mapData} height={350} />

      {/* Lista de Paragens */}
      <MapListWrapper>
        <RouteStopsList routeData={mapData} />
      </MapListWrapper>
    </>
  );
}

/**
 * EXEMPLO 4: Feed com múltiplos mapas (home.js)
 *
 * ⚠️ ATENÇÃO: Renderizar muitos mapas em scroll horizontal pode ser lento!
 * Use ScrollView horizontal com FlatList em vez disso:
 */
export function RoutesMapExample4({ trips = [] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {trips.map((trip) => (
        <TripCardContainer key={trip.id}>
          <RouteMapViewerMini tripId={trip.id} />
        </TripCardContainer>
      ))}
    </ScrollView>
  );
}

/**
 * Componente Mini: Mapa pequeno (sem controles)
 */
function RouteMapViewerMini({ tripId }) {
  const { data: mapData, isLoading } = useRouteMap(tripId);

  if (isLoading || !mapData) {
    return (
      <LoadingBox>
        <ActivityIndicator size="small" color={colors.purple[600]} />
      </LoadingBox>
    );
  }

  // Renderizar apenas a lista de paragens (mais leve)
  return <RouteStopsList routeData={mapData} />;
}

/**
 * ═══════════════════════════════════════════════════════════
 * COMO USAR:
 * ═══════════════════════════════════════════════════════════
 *
 * 1️⃣  IMPORTAR O HOOK
 *     import { useRouteMap } from '../../src/hooks/useRouteMap';
 *
 * 2️⃣  CHAMAR O HOOK
 *     const { data: mapData, isLoading, error } = useRouteMap(tripId);
 *
 * 3️⃣  RENDERIZAR O COMPONENTE
 *     <RouteMapViewer
 *       routeData={mapData}
 *       height={400}
 *       isLoading={isLoading}
 *       error={error}
 *     />
 *
 * 4️⃣  FALLBACK (se não funcionar mapa)
 *     <RouteStopsList routeData={mapData} error={error} />
 *
 * ═══════════════════════════════════════════════════════════
 * PROPS DISPONÍVEIS:
 * ═══════════════════════════════════════════════════════════
 *
 * RouteMapViewer:
 *   - routeData: Dados do mapa (vem do hook useRouteMap)
 *   - height: Altura do mapa em pixels (default: 400)
 *   - isLoading: Mostra loading spinner
 *   - error: Mostra erro
 *
 * RouteStopsList:
 *   - routeData: Dados do mapa
 *   - isLoading: Mostra loading
 *   - error: Mostra erro
 *
 * ═══════════════════════════════════════════════════════════
 * ESTRUTURA DE DADOS RETORNADA POR useRouteMap:
 * ═══════════════════════════════════════════════════════════
 *
 * {
 *   trip: { origin, destination, price, ... },
 *   originCoords: { name, lat, lng, description },
 *   destinationCoords: { name, lat, lng, description },
 *   stopsData: [
 *     { name: "Cuanza Sul", lat: -10.5639, lng: 13.7561 },
 *     { name: "Libolo", lat: -10.9833, lng: 14.8167 }
 *   ],
 *   trajectory: [
 *     { latitude: -8.8383, longitude: 13.2344 },
 *     { latitude: -10.5639, longitude: 13.7561 },
 *     ...
 *   ],
 *   totalDistance: 451.2,      // em KM
 *   estimatedTime: "6h 30m",
 *   debug: { stopsCount: 2, trajectoryPoints: 4 }
 * }
 *
 * ═══════════════════════════════════════════════════════════
 */
