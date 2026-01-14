// File: src/components/tickets/TrackingCard.jsx

import React from 'react';
import { View, Text, Animated } from 'react-native';
import styled from 'styled-components/native';
import { useTicketTracking } from '../../hooks/useTicketTracking';
import { MapPin, Clock, AlertCircle } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  border-radius: 16px;
  padding: ${spacing[6]}px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
  margin-bottom: ${spacing[6]}px;
  background-color: ${props => props.bgColor};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[5]}px;
`;

const StatusBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
`;

const StatusText = styled.Text`
  color: ${props => props.color};
  font-weight: 600;
  font-size: ${fontSize.xs}px;
  text-transform: uppercase;
`;

const EtaText = styled.Text`
  color: ${colors.emerald[600]};
  font-weight: bold;
  font-size: ${fontSize.sm}px;
`;

const ProgressBarContainer = styled.View`
  margin-bottom: ${spacing[4]}px;
  width: 100%;
  height: 12px;
  background-color: ${colors.slate[200]};
  border-radius: 999px;
  overflow: hidden;
`;

const JourneyContainer = styled.View`
  margin-bottom: ${spacing[6]}px;
`;

const JourneyRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const LocationColumn = styled.View`
  flex: 1;
  ${props => props.align === 'right' ? 'align-items: flex-end;' : ''}
`;

const LocationDot = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${props => props.color};
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const LocationLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  font-weight: 500;
`;

const LocationName = styled.Text`
  color: ${colors.slate[900]};
  font-weight: bold;
  font-size: ${fontSize.base}px;
  margin-top: ${spacing[1]}px;
`;

const LocationTime = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
  margin-top: 2px;
`;

const BusIconContainer = styled.View`
  align-items: center;
  padding-horizontal: ${spacing[4]}px;
  padding-top: ${spacing[2]}px;
`;

const BusIcon = styled.Text`
  font-size: 30px;
  ${props => props.isMoving ? 'opacity: 1;' : 'opacity: 0.5;'}
`;

const PercentageText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
  font-weight: 500;
  margin-top: ${spacing[2]}px;
`;

const InfoSection = styled.View`
  flex-direction: row;
  gap: ${spacing[4]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[200]};
  padding-top: ${spacing[4]}px;
`;

const InfoItem = styled.View`
  flex: 1;
`;

const InfoLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[600]};
  font-weight: 500;
  margin-bottom: ${spacing[1]}px;
`;

const InfoValue = styled.Text`
  font-size: ${fontSize.sm}px;
  font-weight: bold;
  color: ${props => props.highlight ? colors.emerald[600] : colors.slate[900]};
`;

const StopsSection = styled.View`
  margin-top: ${spacing[4]}px;
  padding-top: ${spacing[4]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[200]};
`;

const StopsTitle = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[600]};
  font-weight: 600;
  margin-bottom: ${spacing[2]}px;
`;

const StopRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
  padding-vertical: ${spacing[1]}px;
`;

const StopText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[600]};
`;

/**
 * 🚌 Componente de Rastreamento de Viagem
 * Mostra progresso, ETA e status da viagem em tempo real
 */
export function TrackingCard({ ticket }) {
  const tracking = useTicketTracking(ticket);

  // Cores por status
  const getStatusColors = () => {
    switch (tracking.status) {
      case 'AGENDADO':
        return { bg: colors.blue[50], text: colors.blue[700], badge: colors.blue[500] };
      case 'AGUARDANDO_PARTIDA':
        return { bg: colors.amber[50], text: colors.amber[700], badge: colors.amber[500] };
      case 'EM_TRÂNSITO':
        return { bg: colors.emerald[50], text: colors.emerald[700], badge: colors.emerald[500] };
      case 'CHEGOU':
        return { bg: colors.green[50], text: colors.green[700], badge: colors.green[600] };
      default:
        return { bg: colors.slate[50], text: colors.slate[700], badge: colors.slate[500] };
    }
  };

  const statusColors = getStatusColors();

  return (
    <Container bgColor={statusColors.bg}>
      {/* HEADER: Status + ETA */}
      <HeaderRow>
        <StatusBadge>
          <StatusDot color={statusColors.badge} />
          <StatusText color={statusColors.text}>
            {tracking.statusLabel}
          </StatusText>
        </StatusBadge>
        <EtaText>{tracking.eta}</EtaText>
      </HeaderRow>

      {/* PROGRESS BAR */}
      <ProgressBarContainer>
        <Animated.View
          style={{
            width: `${tracking.elapsedPercentage}%`,
            height: '100%',
            backgroundColor: tracking.status === 'CHEGOU' ? colors.green[600] : colors.brand[600],
            borderRadius: 999
          }}
        />
      </ProgressBarContainer>

      {/* ORIGEM -> DESTINO */}
      <JourneyContainer>
        <JourneyRow>
          {/* ORIGEM */}
          <LocationColumn>
            <LocationRow>
              <StatusDot color={colors.emerald[500]} />
              <LocationLabel>ORIGEM</LocationLabel>
            </LocationRow>
            <LocationName>
              {ticket?.trip?.origin}
            </LocationName>
            <LocationTime>
              {new Date(ticket?.trip?.departureTime).toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </LocationTime>
          </LocationColumn>

          {/* ÍCONE AUTOCARRO QUE ANDA */}
          <BusIconContainer>
            <BusIcon isMoving={tracking.status === 'EM_TRÂNSITO'}>🚌</BusIcon>
            <PercentageText>{tracking.elapsedPercentage}%</PercentageText>
          </BusIconContainer>

          {/* DESTINO */}
          <LocationColumn align="right">
            <LocationRow>
              <LocationLabel>DESTINO</LocationLabel>
              <StatusDot color={colors.red[500]} />
            </LocationRow>
            <LocationName>
              {ticket?.trip?.destination}
            </LocationName>
            <LocationTime>
              {new Date(ticket?.trip?.arrivalTime).toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </LocationTime>
          </LocationColumn>
        </JourneyRow>
      </JourneyContainer>

      {/* INFO: Tempo Decorrido + Tempo Restante */}
      <InfoSection>
        <InfoItem>
          <InfoLabel>Decorrido</InfoLabel>
          <InfoValue>
            {tracking.elapsedTime}
          </InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoLabel>Restante</InfoLabel>
          <InfoValue highlight>
            {tracking.remainingTime}
          </InfoValue>
        </InfoItem>
      </InfoSection>

      {/* DICA: Se em trânsito, mostrar paragens próximas */}
      {tracking.status === 'EM_TRÂNSITO' && ticket?.trip?.stops?.length > 0 && (
        <StopsSection>
          <StopsTitle>PRÓXIMAS PARAGENS:</StopsTitle>
          {ticket.trip.stops.map((stop, idx) => (
            <StopRow key={idx}>
              <MapPin width={12} height={12} color={colors.slate[400]} />
              <StopText>{stop}</StopText>
            </StopRow>
          ))}
        </StopsSection>
      )}
    </Container>
  );
}
