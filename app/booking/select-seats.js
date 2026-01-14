// File: app/booking/select-seats.js

import React, { useEffect } from 'react';
import { ScrollView, Alert, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components/native';
import api from '../../src/lib/api';
import { useCartStore } from '../../src/store/useCartStore';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

const formatKz = (v) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Content = styled(ScrollView).attrs({
  contentContainerStyle: { paddingBottom: 180 },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  padding: ${spacing[6]}px;
`;

const Header = styled.View`
  margin-bottom: ${spacing[8]}px;
`;

const Title = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  letter-spacing: -0.5px;
`;

const Subtitle = styled.Text`
  color: ${colors.slate[500]};
  margin-top: ${spacing[1]}px;
  font-size: ${fontSize.sm}px;
`;

// --- SEAT MAP COMPONENT STYLES ---

const BusLayout = styled.View`
  align-items: center;
  background-color: ${colors.white};
  border-radius: 24px;
  padding: ${spacing[6]}px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
  ${shadows.sm}
`;

const FrontBus = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing[8]}px;
  padding-bottom: ${spacing[4]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
`;

const DriverSeat = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${colors.slate[300]};
  align-items: center;
  justify-content: center;
  opacity: 0.5;
`;

const DriverLabel = styled.Text`
  font-size: 8px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[400]};
  text-transform: uppercase;
`;

const GridRow = styled.View`
  flex-direction: row;
  margin-bottom: ${spacing[3]}px;
  gap: ${spacing[3]}px;
`;

const Aisle = styled.View`
  width: 24px;
`;

// O Assento "Tech" (Geométrico)
const SeatBox = styled.Pressable`
  width: 48px;
  height: 48px;
  border-radius: 12px; /* Curva técnica, não redonda */
  align-items: center;
  justify-content: center;
  background-color: ${props => {
    if (props.occupied) return '#fee2e2'; 
    if (props.selected) return '#7c3aed'; 
    return '#ffffff';
  }};
  border-width: 2px;
  border-style: solid;
  border-color: ${props => {
    if (props.occupied) return '#ef4444'; 
    if (props.selected) return '#7c3aed'; 
    return '#e2e8f0'; 
  }};
  elevation: ${props => (props.occupied || props.selected ? 0 : 2)};
  ${props => !props.occupied && !props.selected && shadows.sm}
`;

const SeatNumber = styled.Text`
  font-size: 14px;
  font-weight: ${fontWeight.bold};
  color: ${props => {
    if (props.occupied) return '#dc2626'; // colors.red[600] literal
    if (props.selected) return '#ffffff';
    return '#475569'; // colors.slate[600]
  }};
`;

const LegendContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${spacing[6]}px;
  margin-top: ${spacing[8]}px;
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const LegendDot = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border-width: ${props => props.border ? '1px' : '0px'};
  border-color: ${colors.slate[300]};
`;

const LegendText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.medium};
`;

// Footer
const Footer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${colors.white};
  padding: ${spacing[6]}px;
  padding-bottom: 32px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[100]};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${shadows.lg}
`;

const SelectionInfo = styled.View``;

const SelectionLabel = styled.Text`
  font-size: 10px;
  color: ${colors.slate[500]};
  text-transform: uppercase;
  font-weight: ${fontWeight.bold};
`;

const SelectionValue = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.brand[600]};
`;

const ContinueButton = styled.TouchableOpacity`
  background-color: ${props => props.disabled ? colors.slate[200] : colors.brand[600]};
  padding-horizontal: ${spacing[8]}px;
  padding-vertical: ${spacing[4]}px;
  border-radius: 12px;
`;

const ContinueText = styled.Text`
  color: ${props => props.disabled ? colors.slate[400] : colors.white};
  font-weight: ${fontWeight.bold};
`;

export default function SelectSeatsScreen() {
  const router = useRouter();
  
  const trip = useCartStore((state) => state.trip);
  const selectedSeats = useCartStore((state) => state.selectedSeats);
  const toggleSeat = useCartStore((state) => state.toggleSeat);
  const totalPrice = useCartStore((state) => state.getTotal());

  useEffect(() => {
    if (!trip) router.replace('/(tabs)/home');
  }, [trip]);

  // ✅ BUSCA REAL DE ASSENTOS OCUPADOS
  const { data: seatsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['trip-seats', trip?.id],
    queryFn: async () => {
      const response = await api.get(`/trips/${trip.id}/seats`);
      return response.data.data;
    },
    enabled: !!trip?.id,
    refetchInterval: 5000, // Atualiza a cada 5s para evitar conflitos
  });

  const occupiedSeats = seatsData?.occupiedSeats || [];
  const totalSeats = seatsData?.totalSeats || trip?.bus?.totalSeats || 40;

  const handleNext = () => {
    if (selectedSeats.length === 0) return;
    router.push('/booking/add-snacks');
  };

  const renderSeat = (num) => {
    // Evita renderizar assentos que não existem (última fila)
    if (num > totalSeats) {
        return <View style={{ width: 48, height: 48 }} />;
    }

    const isOccupied = occupiedSeats.includes(num);
    const isSelected = selectedSeats.includes(num);

    return (
      <SeatBox 
        key={num}
        occupied={isOccupied} 
        selected={isSelected}
        onPress={() => !isOccupied && toggleSeat(num)}
        disabled={isOccupied}
        style={({ pressed }) => [{
            opacity: pressed && !isOccupied ? 0.8 : 1,
            transform: [{ scale: pressed && !isOccupied ? 0.95 : 1 }]
        }]}
      >
        <SeatNumber occupied={isOccupied} selected={isSelected}>{num}</SeatNumber>
      </SeatBox>
    );
  };

  // Gerador de Grid 2-2
  const renderGrid = () => {
    let rows = [];
    
    if (isLoading) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} size="large" />
          <Subtitle>Verificando disponibilidade...</Subtitle>
        </View>
      );
    }

    if (isError) {
        return (
            <View style={{ padding: 40, alignItems: 'center' }}>
                <Subtitle style={{ color: colors.red[500], marginBottom: 16 }}>Erro ao carregar mapa de assentos</Subtitle>
                <ContinueButton onPress={() => refetch()}>
                    <ContinueText>Tentar Novamente</ContinueText>
                </ContinueButton>
            </View>
        );
    }

    for (let i = 0; i < totalSeats; i += 4) {
      rows.push(
        <GridRow key={i}>
          {renderSeat(i + 1)}
          {renderSeat(i + 2)}
          <Aisle />
          {renderSeat(i + 3)}
          {renderSeat(i + 4)}
        </GridRow>
      );
    }
    return rows;
  };

  if (!trip) return null;

  return (
    <Container>
      <Content>
        <Header>
          <Title>Seleção de Assentos</Title>
          <Subtitle>Toque para selecionar os assentos disponíveis.</Subtitle>
        </Header>

        <BusLayout>
          {/* Frente do Autocarro */}
          <FrontBus>
            <DriverSeat>
              <DriverLabel>CONDUTOR</DriverLabel>
            </DriverSeat>
            <View />
          </FrontBus>

          {/* Grid de Assentos */}
          <View>
            {renderGrid()}
          </View>

          {/* Legenda */}
          <LegendContainer>
            <LegendItem>
              <LegendDot color={colors.white} border />
              <LegendText>Livre</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendDot color={colors.brand[600]} />
              <LegendText>Selecionado</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendDot color={colors.red[500]} />
              <LegendText>Ocupado</LegendText>
            </LegendItem>
          </LegendContainer>
        </BusLayout>
      </Content>

      <Footer>
        <SelectionInfo>
          <SelectionLabel>{selectedSeats.length} Assentos</SelectionLabel>
          <SelectionValue>{formatKz(totalPrice)}</SelectionValue>
        </SelectionInfo>
        
        <ContinueButton onPress={handleNext} disabled={selectedSeats.length === 0}>
          <ContinueText disabled={selectedSeats.length === 0}>Continuar</ContinueText>
        </ContinueButton>
      </Footer>
    </Container>
  );
}