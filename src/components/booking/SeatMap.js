// File: src/components/booking/SeatMap.js

import React from 'react';
import styled from 'styled-components/native';
import { Armchair, User } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  backgroundColor: ${colors.white};
  borderRadius: 24px;
  padding: ${spacing[6]}px;
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.05;
  shadowRadius: 4;
  shadowOffset: 0 2;
  borderWidth: 1px;
  borderColor: ${colors.slate[100]};
`;

const DriverSection = styled.View`
  align-items: center;
  margin-bottom: ${spacing[6]}px;
  opacity: 0.5;
`;

const DriverLine = styled.View`
  width: 100%;
  height: 4px;
  background-color: ${colors.slate[200]};
  border-radius: 2px;
  margin-bottom: ${spacing[2]}px;
`;

const DriverRowContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding-horizontal: ${spacing[8]}px;
`;

const DriverColumn = styled.View`
  align-items: center;
`;

const DriverIcon = styled.View`
  width: 40px;
  height: 40px;
  border-width: 2px;
  border-color: ${colors.slate[300]};
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

const DriverLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
  margin-top: ${spacing[1]}px;
  text-transform: uppercase;
  font-weight: ${fontWeight.bold};
`;

const DoorBox = styled.View`
  width: 40px;
  height: 40px;
  border-width: 2px;
  border-style: dashed;
  border-color: ${colors.slate[300]};
  border-radius: 8px;
  background-color: ${colors.slate[50]};
  align-items: center;
  justify-content: center;
`;

const DoorLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
`;

const GridContainer = styled.View``;

const GridRow = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${spacing[1]}px;
`;

const Aisle = styled.View`
  width: 32px;
`;

const SeatButton = styled.Pressable`
  width: 48px;
  height: 48px;
  margin: ${spacing[1]}px;
  border-radius: 12px;
  border-width: 1px;
  align-items: center;
  justify-content: center;
  background-color: ${props => {
    if (props.occupied) return colors.slate[200];
    return props.selected ? colors.brand[600] : colors.slate[100];
  }};
  borderColor: ${props => {
    if (props.occupied) return colors.slate[300];
    return props.selected ? colors.brand[700] : colors.slate[200];
  }};
  opacity: ${props => (props.occupied ? 0.5 : 1)};
  shadowColor: ${props => (props.selected ? colors.brand[500] : 'transparent')};
  shadowOpacity: 0.3;
  shadowRadius: 4;
`;

const SeatNumber = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${props => (props.selected ? colors.white : colors.slate[500])};
  margin-top: ${spacing[1]}px;
`;

const Legend = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${spacing[4]}px;
  margin-top: ${spacing[8]}px;
  padding-top: ${spacing[4]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[50]};
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const LegendBox = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border-width: ${props => (props.border ? 1 : 0)};
  border-color: ${props => (props.borderColor || colors.slate[200])};
  opacity: ${props => (props.occupied ? 0.5 : 1)};
`;

const LegendText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${props => (props.bold ? colors.slate[900] : colors.slate[500])};
  font-weight: ${props => (props.bold ? fontWeight.bold : fontWeight.normal)};
`;

export function SeatMap({ 
  totalSeats = 45, 
  occupiedSeats = [], 
  selectedSeats = [], 
  onToggleSeat 
}) {
  const renderSeat = (seatNum) => {
    const isOccupied = occupiedSeats.includes(seatNum);
    const isSelected = selectedSeats.includes(seatNum);

    return (
      <SeatButton
        key={seatNum}
        onPress={() => !isOccupied && onToggleSeat(seatNum)}
        disabled={isOccupied}
        occupied={isOccupied}
        selected={isSelected}
      >
        <Armchair 
          size={20} 
          color={isOccupied ? colors.slate[400] : isSelected ? colors.white : colors.slate[400]} 
          strokeWidth={2.5}
        />
        <SeatNumber selected={isSelected}>{seatNum}</SeatNumber>
      </SeatButton>
    );
  };

  const renderGrid = () => {
    const rows = Math.ceil(totalSeats / 4);
    const grid = [];

    for (let i = 0; i < rows; i++) {
      const rowSeats = [];
      const base = i * 4;

      rowSeats.push(renderSeat(base + 1));
      rowSeats.push(renderSeat(base + 2));
      rowSeats.push(<Aisle key={`aisle-${i}`} />);

      if (base + 3 <= totalSeats) rowSeats.push(renderSeat(base + 3));
      if (base + 4 <= totalSeats) rowSeats.push(renderSeat(base + 4));

      grid.push(
        <GridRow key={i}>
          {rowSeats}
        </GridRow>
      );
    }
    return grid;
  };

  return (
    <Container>
      <DriverSection>
        <DriverLine />
        <DriverRowContainer>
          <DriverColumn>
            <DriverIcon>
              <User size={20} color={colors.slate[400]} />
            </DriverIcon>
            <DriverLabel>Motorista</DriverLabel>
          </DriverColumn>
          <DriverColumn>
            <DoorBox>
              <DoorLabel>Porta</DoorLabel>
            </DoorBox>
          </DriverColumn>
        </DriverRowContainer>
      </DriverSection>

      <GridContainer>
        {renderGrid()}
      </GridContainer>

      <Legend>
        <LegendItem>
          <LegendBox border borderColor={colors.slate[200]} color={colors.slate[100]} />
          <LegendText>Livre</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendBox color={colors.brand[600]} />
          <LegendText bold>Seu</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendBox occupied color={colors.slate[200]} />
          <LegendText>Ocupado</LegendText>
        </LegendItem>
      </Legend>
    </Container>
  );
}