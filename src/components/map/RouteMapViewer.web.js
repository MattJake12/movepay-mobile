// File: src/components/map/RouteMapViewer.web.js

/**
 * 🗺️ Componente: RouteMapViewer (WEB VERSION)
 * Exibe informações de mapa em formato de card para web
 *
 * Props:
 *   - routeData: { trajectory, stopsData, originCoords, destinationCoords, totalDistance, estimatedTime }
 *   - height: altura do mapa (default: 400)
 *   - isLoading: mostrar skeleton
 *   - error: mostrar erro
 */

import React from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { MapPin, Clock, Navigation, AlertCircle } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  height: ${props => props.height}px;
  background-color: ${colors.slate[50]};
  padding: ${spacing[3]}px;
  border-radius: 12px;
`;

const LoadingBox = styled.View`
  height: ${props => props.height}px;
  background-color: ${colors.slate[100]};
  justify-content: center;
  align-items: center;
`;

const ErrorBox = styled.View`
  height: ${props => props.height}px;
  background-color: ${colors.red[50]};
  justify-content: center;
  align-items: center;
  padding: ${spacing[3]}px;
`;

const ErrorText = styled.Text`
  color: ${colors.red[600]};
  margin-top: ${spacing[2]}px;
  text-align: center;
  font-size: ${fontSize.base}px;
`;

const Header = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  margin-bottom: ${spacing[3]}px;
  color: ${colors.slate[900]};
`;

const Section = styled.View`
  margin-bottom: ${spacing[3]}px;
  padding-bottom: ${spacing[3]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[200]};
`;

const SectionRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
`;

const SectionLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[600]};
  font-weight: ${fontWeight.semibold};
  text-transform: uppercase;
`;

const SectionValue = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${colors.slate[900]};
  margin-top: ${spacing[1]}px;
`;

const IconWrapper = styled.View`
  margin-right: ${spacing[2]}px;
  margin-top: ${spacing[1]}px;
`;

const ContentWrapper = styled.View`
  flex: 1;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StopsContainer = styled.View`
  padding: ${spacing[3]}px;
`;

const StopsHeader = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  margin-bottom: ${spacing[3]}px;
  color: ${colors.slate[900]};
`;

const StopCard = styled.View`
  padding: ${spacing[3]}px;
  background-color: ${colors.white};
  marginBottom: ${spacing[2]}px;
  borderRadius: 8px;
  borderLeftWidth: 4px;
  borderLeftColor: ${colors.blue[500]};
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.05;
  shadowRadius: 2;
  shadowOffset: 0 1;
`;

const StopCardNumber = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const StopCardAddress = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[600]};
  margin-top: ${spacing[1]}px;
`;

const StopCardCoords = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
  margin-top: ${spacing[1]}px;
`;

export default function RouteMapViewer({
  routeData,
  height = 400,
  isLoading = false,
  error = null,
}) {
  if (isLoading) {
    return (
      <Container height={height}>
        <LoadingBox height={height}>
          <ActivityIndicator size="large" color={colors.purple[600]} />
        </LoadingBox>
      </Container>
    );
  }

  if (error) {
    return (
      <Container height={height}>
        <ErrorBox height={height}>
          <AlertCircle size={24} color={colors.red[600]} />
          <ErrorText>{error}</ErrorText>
        </ErrorBox>
      </Container>
    );
  }

  return (
    <Container height={height}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>📍 Informações da Rota</Header>

        {/* ORIGIN */}
        {routeData?.originCoords && (
          <Section>
            <SectionRow>
              <IconWrapper>
                <MapPin size={16} color={colors.blue[500]} strokeWidth={2} />
              </IconWrapper>
              <ContentWrapper>
                <SectionLabel>Origem</SectionLabel>
                <SectionValue>
                  Lat: {routeData.originCoords.latitude?.toFixed(4)}°
                </SectionValue>
                <SectionValue>
                  Lng: {routeData.originCoords.longitude?.toFixed(4)}°
                </SectionValue>
              </ContentWrapper>
            </SectionRow>
          </Section>
        )}

        {/* DESTINATION */}
        {routeData?.destinationCoords && (
          <Section>
            <SectionRow>
              <IconWrapper>
                <MapPin size={16} color={colors.red[500]} strokeWidth={2} />
              </IconWrapper>
              <ContentWrapper>
                <SectionLabel>Destino</SectionLabel>
                <SectionValue>
                  Lat: {routeData.destinationCoords.latitude?.toFixed(4)}°
                </SectionValue>
                <SectionValue>
                  Lng: {routeData.destinationCoords.longitude?.toFixed(4)}°
                </SectionValue>
              </ContentWrapper>
            </SectionRow>
          </Section>
        )}

        {/* DISTANCE */}
        {routeData?.totalDistance && (
          <Section>
            <InfoRow>
              <IconWrapper>
                <Navigation size={16} color={colors.emerald[500]} strokeWidth={2} />
              </IconWrapper>
              <SectionValue>
                <SectionLabel>Distância: </SectionLabel>
                {(routeData.totalDistance / 1000).toFixed(1)} km
              </SectionValue>
            </InfoRow>
          </Section>
        )}

        {/* TIME */}
        {routeData?.estimatedTime && (
          <InfoRow>
            <IconWrapper>
              <Clock size={16} color={colors.amber[500]} strokeWidth={2} />
            </IconWrapper>
            <SectionValue>
              <SectionLabel>Tempo: </SectionLabel>
              {Math.round(routeData.estimatedTime / 60)} min
            </SectionValue>
          </InfoRow>
        )}
      </ScrollView>
    </Container>
  );
}

export const RouteStopsList = ({ stops = [], isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <StopsContainer>
        <ActivityIndicator size="large" color={colors.purple[600]} />
      </StopsContainer>
    );
  }

  if (error) {
    return (
      <StopsContainer>
        <SectionValue style={{ color: colors.red[600] }}>
          Erro ao carregar paradas
        </SectionValue>
      </StopsContainer>
    );
  }

  if (!stops || stops.length === 0) {
    return (
      <StopsContainer>
        <SectionValue style={{ color: colors.slate[600] }}>
          Nenhuma parada encontrada
        </SectionValue>
      </StopsContainer>
    );
  }

  return (
    <ScrollView style={{ padding: spacing[3] }}>
      <StopsHeader>🚌 Paradas ({stops.length})</StopsHeader>
      {stops.map((stop, idx) => (
        <StopCard key={stop.id || idx}>
          <StopCardNumber>
            {idx + 1}. {stop.name}
          </StopCardNumber>
          {stop.address && (
            <StopCardAddress>{stop.address}</StopCardAddress>
          )}
          {(stop.latitude || stop.longitude) && (
            <StopCardCoords>
              {stop.latitude?.toFixed(4)}°, {stop.longitude?.toFixed(4)}°
            </StopCardCoords>
          )}
        </StopCard>
      ))}
    </ScrollView>
  );
};
