// File: src/components/cards/TicketCard.js

import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { ChevronRight, Calendar, Clock } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../theme/theme';

// ===== HELPERS =====
const getStatusConfig = (status) => {
  switch (status) {
    case 'VALID': return { color: colors.emerald[600], bg: colors.emerald[50], label: 'Confirmado' };
    case 'PENDING': return { color: colors.orange[600], bg: colors.orange[50], label: 'Pendente' };
    case 'CANCELLED': return { color: colors.red[600], bg: colors.red[50], label: 'Cancelado' };
    default: return { color: colors.slate[500], bg: colors.slate[100], label: status };
  }
};

// 🎯 Helper para calcular duração em horas e minutos
const calculateDuration = (departureTime, arrivalTime) => {
  const diff = new Date(arrivalTime) - new Date(departureTime);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
};

// ===== STYLED COMPONENTS =====

const Container = styled.TouchableOpacity.attrs({
  style: shadows.sm
})`
  background-color: ${colors.white};
  border-radius: 16px;
  margin-bottom: ${spacing[4]}px;
  overflow: hidden; /* Importante para cortar os círculos do rasgo */
`;

const MainSection = styled.View`
  padding: ${spacing[5]}px;
  padding-bottom: ${spacing[6]}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[4]}px;
`;

const DateBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background-color: ${colors.slate[50]};
  padding: 6px 10px;
  border-radius: 8px;
`;

const DateText = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[700]};
`;

const OperatorName = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[500]};
`;

const StatusBadge = styled.View`
  padding: 4px 8px;
  border-radius: 6px;
  background-color: ${props => props.bg};
`;

const StatusText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  color: ${props => props.color};
  text-transform: uppercase;
`;

const RouteRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const CityCode = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.black};
  color: ${colors.slate[900]};
`;

const CityName = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.medium};
  margin-top: 2px;
`;

const ArrowContainer = styled.View`
  align-items: center;
`;

const DurationText = styled.Text`
  font-size: 10px;
  color: ${colors.slate[400]};
  font-weight: ${fontWeight.bold};
  margin-bottom: 4px;
`;

// EFEITO DE RASGO (TEAR)
const TearContainer = styled.View`
  height: 24px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.white};
  position: relative;
  z-index: 10;
`;

const Circle = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${colors.slate[50]}; /* Cor do fundo da tela */
  /* Posicionamento negativo para "morder" o card */
`;

const DashedLine = styled.View`
  flex: 1;
  height: 1px;
  border-top-width: 1px;
  border-color: ${colors.slate[200]};
  border-style: dashed;
  margin-horizontal: ${spacing[2]}px;
`;

const BottomSection = styled.View`
  padding: ${spacing[4]}px ${spacing[5]}px;
  background-color: ${colors.white};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DetailItem = styled.View``;

const Label = styled.Text`
  font-size: 10px;
  color: ${colors.slate[400]};
  text-transform: uppercase;
  font-weight: ${fontWeight.bold};
  margin-bottom: 2px;
`;

const Value = styled.Text`
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[800]};
`;

const ViewDetails = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ViewText = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.brand[600]};
`;

// 🎯 NOVO: Badge para indicar "Melhor Oferta" ou "Comprar Agora"
const HighlightBadge = styled.View`
  position: absolute;
  top: ${spacing[3]}px;
  right: ${spacing[3]}px;
  background-color: ${colors.brand[600]};
  border-radius: 20px;
  padding-vertical: 4px;
  padding-horizontal: 8px;
  z-index: 20;
`;

const HighlightText = styled.Text`
  font-size: 9px;
  font-weight: ${fontWeight.black};
  color: ${colors.white};
  text-transform: uppercase;
`;

export function TicketCard({ ticket, onPress, showQrAction = false }) {
  const status = getStatusConfig(ticket.status);
  const date = new Date(ticket.trip.departureTime);
  const { hours, minutes } = calculateDuration(ticket.trip.departureTime, ticket.trip.arrivalTime);

  return (
    <Container activeOpacity={0.8} onPress={onPress}>
      {/* 🎯 Badge de Ação (Para "Próximas", mostra QR Code) */}
      {showQrAction && (
        <HighlightBadge>
          <HighlightText>🎫 Ver QR</HighlightText>
        </HighlightBadge>
      )}

      {/* SEÇÃO PRINCIPAL */}
      <MainSection>
        <Header>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <DateBadge>
              <Calendar size={14} color={colors.slate[500]} />
              <DateText>{date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}</DateText>
            </DateBadge>
            <OperatorName numberOfLines={1}>
              {ticket.trip.company?.name || 'Operadora'}
            </OperatorName>
          </View>
          <StatusBadge bg={status.bg}>
            <StatusText color={status.color}>{status.label}</StatusText>
          </StatusBadge>
        </Header>

        <RouteRow>
          <View>
            <CityCode>{ticket.trip.origin.substring(0, 3).toUpperCase()}</CityCode>
            <CityName>{ticket.trip.origin}</CityName>
          </View>

          <ArrowContainer>
            <DurationText>{hours}h {minutes}m</DurationText>
            <ChevronRight size={20} color={colors.slate[300]} />
          </ArrowContainer>

          <View style={{ alignItems: 'flex-end' }}>
            <CityCode>{ticket.trip.destination.substring(0, 3).toUpperCase()}</CityCode>
            <CityName>{ticket.trip.destination}</CityName>
          </View>
        </RouteRow>
      </MainSection>

      {/* RASGO DECORATIVO */}
      <TearContainer>
        <Circle style={{ marginLeft: -12 }} />
        <DashedLine />
        <Circle style={{ marginRight: -12 }} />
      </TearContainer>

      {/* RODAPÉ */}
      <BottomSection>
        <DetailItem>
          <Label>Horário</Label>
          <Value>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Value>
        </DetailItem>

        <DetailItem>
          <Label>Assento</Label>
          <Value>{ticket.seatNumber}</Value>
        </DetailItem>

        <ViewDetails>
          <ViewText>Ver Bilhete</ViewText>
          <ChevronRight size={14} color={colors.brand[600]} />
        </ViewDetails>
      </BottomSection>
    </Container>
  );
}