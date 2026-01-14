// File: src/components/cards/TripCard.js

import React from 'react';
import styled from 'styled-components/native';
import { Clock, Star, ArrowRight } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../theme/theme';

const formatKz = (v) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);

// ===== STYLED COMPONENTS =====

const Card = styled.Pressable.attrs({
  style: shadows.md
})`
  background-color: ${colors.white};
  border-radius: 16px;
  padding: ${spacing[5]}px;
  margin-bottom: ${spacing[4]}px;
  border-width: 1px;
  border-color: ${colors.slate[50]};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[4]}px;
`;

const CompanyBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const LogoBox = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${colors.slate[50]};
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: 10px;
  color: ${colors.slate[500]};
`;

const CompanyName = styled.Text`
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[700]};
`;

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.yellow[50]};
  padding-horizontal: 6px;
  padding-vertical: 2px;
  border-radius: 4px;
  gap: 4px;
`;

const RatingText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  color: ${colors.yellow[700]};
`;

const TimelineContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TimeBlock = styled.View`
  align-items: ${props => props.align || 'flex-start'};
`;

const TimeText = styled.Text`
  font-size: ${fontSize.xl}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  letter-spacing: -0.5px;
`;

const CityText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.medium};
  margin-top: 2px;
`;

// Visualizador de Duração (Linha com seta)
const DurationVisual = styled.View`
  flex: 1;
  align-items: center;
  padding-horizontal: ${spacing[4]}px;
`;

const DurationText = styled.Text`
  font-size: 10px;
  color: ${colors.slate[400]};
  font-weight: ${fontWeight.bold};
  margin-bottom: 4px;
`;

const LineContainer = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

const Dot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${colors.slate[300]};
`;

const Line = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${colors.slate[200]};
`;

const ArrowIcon = styled(ArrowRight).attrs({
  size: 12,
  color: colors.slate[300]
})``;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: ${spacing[4]}px;
  padding-top: ${spacing[3]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[50]};
`;

const PriceText = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.extrabold};
  color: ${colors.brand[600]};
`;

const SeatsLeft = styled.Text`
  font-size: 10px;
  color: ${colors.red[500]};
  font-weight: ${fontWeight.medium};
  background-color: ${colors.red[50]};
  padding: 4px 8px;
  border-radius: 4px;
`;

export function TripCard({ trip, onPress }) {
  // Calculadora de Duração Simples
  const start = new Date(trip.departureTime);
  const end = new Date(trip.arrivalTime);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.round((diffMs % 3600000) / 60000);

  return (
    <Card onPress={onPress} activeOpacity={0.7}>
      {/* HEADER: OPERADORA & RATING */}
      <Header>
        <CompanyBadge>
          <LogoBox>
            {/* Fallback se não tiver logo */}
            <LogoText>{trip.company.name.charAt(0)}</LogoText>
          </LogoBox>
          <CompanyName>{trip.company.name}</CompanyName>
        </CompanyBadge>
        
        <RatingContainer>
          <Star size={10} color={colors.yellow[600]} fill={colors.yellow[600]} />
          <RatingText>4.8</RatingText>
        </RatingContainer>
      </Header>

      {/* TIMELINE: HORA -> HORA */}
      <TimelineContainer>
        <TimeBlock>
          <TimeText>{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</TimeText>
          <CityText>{trip.origin}</CityText>
        </TimeBlock>

        <DurationVisual>
          <DurationText>{hours}h {minutes > 0 ? `${minutes}m` : ''}</DurationText>
          <LineContainer>
            <Dot />
            <Line />
            <ArrowIcon />
          </LineContainer>
        </DurationVisual>

        <TimeBlock align="flex-end">
          <TimeText>{end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</TimeText>
          <CityText>{trip.destination}</CityText>
        </TimeBlock>
      </TimelineContainer>

      {/* FOOTER: PREÇO */}
      <Footer>
        <SeatsLeft>3 lugares restantes</SeatsLeft>
        <PriceText>{formatKz(trip.price)}</PriceText>
      </Footer>
    </Card>
  );
}