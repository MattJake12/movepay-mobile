// File: app/(tabs)/operator.js

import React, { useState } from 'react';
import { ScrollView, RefreshControl, StatusBar, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  Bus, 
  QrCode, 
  Calendar, 
  AlertCircle,
  ChevronRight,
  DollarSign,
  FileText,
  CheckCircle2
} from 'lucide-react-native';
import api from '../../src/lib/api';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';
import { OperatorGuard } from '../../src/components/OperatorGuard';

// ===== STYLED COMPONENTS =====

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  padding: ${spacing[6]}px;
  background-color: ${colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
`;

const Title = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const Subtitle = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[500]};
  margin-top: 4px;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: ${spacing[6]}px;
`;

// Stats Grid
const Grid = styled.View`
  flex-direction: row;
  gap: ${spacing[4]}px;
  margin-bottom: ${spacing[4]}px;
`;

// ===================================
// MENU DE ACESSO RÁPIDO DO OPERADOR
// ===================================

const QuickActionsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${spacing[3]}px;
  margin-bottom: ${spacing[6]}px;
`;

const ActionCard = styled.TouchableOpacity`
  background-color: ${colors.white};
  padding: ${spacing[4]}px;
  border-radius: 16px;
  width: 48%; /* 2 por linha */
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${colors.slate[100]};
  ${shadows.sm}
`;

const ActionIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props => props.bg || colors.slate[100]};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[2]}px;
`;

const ActionLabel = styled.Text`
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[700]};
  text-align: center;
`;

const StatCard = styled.View.attrs({
  style: shadows.sm
})`
  flex: 1;
  background-color: ${colors.white};
  padding: ${spacing[4]}px;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${colors.slate[100]};
`;

const IconBox = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${props => props.bg};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[2]}px;
`;

const StatValue = styled.Text`
  font-size: ${fontSize.xl}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const StatLabel = styled.Text`
  font-size: 10px;
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  margin-top: 2px;
`;

// Section
const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${spacing[4]}px;
  margin-bottom: ${spacing[4]}px;
`;

const SectionTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

// Trip Item (Operator View)
const TripItem = styled.TouchableOpacity`
  background-color: ${colors.white};
  border-radius: 12px;
  padding: ${spacing[4]}px;
  margin-bottom: ${spacing[3]}px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
  flex-direction: row;
  align-items: center;
`;

const TripTime = styled.View`
  align-items: center;
  margin-right: ${spacing[4]}px;
  min-width: 48px;
`;

const TimeText = styled.Text`
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const DateText = styled.Text`
  font-size: 10px;
  color: ${colors.slate[500]};
`;

const TripInfo = styled.View`
  flex: 1;
`;

const RouteText = styled.Text`
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[800]};
  font-size: ${fontSize.base}px;
`;

const BusInfo = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  margin-top: 2px;
`;

const OccupancyBadge = styled.View`
  background-color: ${props => props.full ? colors.red[50] : colors.emerald[50]};
  padding: 4px 8px;
  border-radius: 6px;
  align-items: center;
`;

const OccupancyText = styled.Text`
  font-weight: ${fontWeight.bold};
  color: ${props => props.full ? colors.red[600] : colors.emerald[600]};
  font-size: ${fontSize.xs}px;
`;

// Action Buttons (Manifesto + Check-in)
const ActionButtons = styled.View`
  flex-direction: row;
  gap: ${spacing[2]}px;
  margin-left: ${spacing[2]}px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 6px 10px;
  border-radius: 8px;
  background-color: ${props => props.primary ? colors.brand[600] : colors.slate[100]};
  align-items: center;
  justify-content: center;
`;

// Scanner Button
const FabButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${colors.brand[600]};
  align-items: center;
  justify-content: center;
  ${shadows.lg}
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(value);
};

export default function OperatorScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Real Data Query
  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['operator-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/operator/dashboard');
      console.log('✅ Dashboard Data:', data);
      
      const stats = data.data;
      
      // Transform API data to UI format
      return {
        stats: {
          todayTrips: stats.tripsToday,
          passengers: stats.passengersToday,
          revenue: formatCurrency(stats.revenueToday)
        },
        trips: stats.trips.map(trip => ({
          id: trip.id, // UUID real
          time: new Date(trip.departureTime).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
          origin: trip.origin,
          destination: trip.destination,
          bus: trip.bus?.model || 'Desconhecido',
          seats: `${trip._count?.tickets || 0}/${trip.bus?.totalSeats || 0}`,
          isFull: (trip._count?.tickets || 0) >= (trip.bus?.totalSeats || 0)
        }))
      };
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };


  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </LoadingContainer>
    );
  }

  return (
    <OperatorGuard>
    <Container>
      <StatusBar barStyle="dark-content" />
      
      <Header>
        <Title>Painel Operacional</Title>
        <Subtitle>Visão geral do dia</Subtitle>
      </Header>

      <Content
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ============ AÇÕES RÁPIDAS (BOTOES FUNCIONAIS) ============ */}
        <QuickActionsGrid>
            {/* 1. Validar Bilhetes (QR Code) */}
            <ActionCard onPress={() => router.push({
               pathname: '/driver/check-in',
               params: { tripId: dashboard?.trips[0]?.id || 'latest' } // Usa o primeiro trip como padrão
            })}>
               <ActionIcon bg={colors.brand[50]}>
                   <QrCode size={24} color={colors.brand[600]} />
               </ActionIcon>
               <ActionLabel>Validar QR</ActionLabel>
            </ActionCard>

             {/* 2. Manifesto de Embarque */}
            <ActionCard onPress={() => router.push({
               pathname: '/driver/manifest',
               params: { tripId: dashboard?.trips[0]?.id || 'latest' }
            })}>
               <ActionIcon bg={colors.blue[50]}>
                   <Users size={24} color={colors.blue[600]} />
               </ActionIcon>
               <ActionLabel>Manifesto</ActionLabel>
            </ActionCard>

            {/* 3. Vender Bilhete (POS) */}
            <ActionCard onPress={() => router.push('/driver/sales')}>
               <ActionIcon bg={colors.green[50]}>
                   <DollarSign size={24} color={colors.green[600]} />
               </ActionIcon>
               <ActionLabel>Vender Ticket</ActionLabel>
            </ActionCard>

             {/* 4. Scanner de Carga */}
            <ActionCard onPress={() => router.push('/cargo/scanner')}>
               <ActionIcon bg={colors.orange[50]}>
                   <Bus size={24} color={colors.orange[600]} />
               </ActionIcon>
               <ActionLabel>Cargas</ActionLabel>
            </ActionCard>
        </QuickActionsGrid>

        {/* ESTATÍSTICAS */}
        <SectionHeader>
            <SectionTitle>Visão Geral</SectionTitle>
        </SectionHeader>
        <Grid>
          <StatCard>
            <IconBox bg={colors.blue[50]}>
              <Bus size={18} color={colors.blue[600]} />
            </IconBox>
            <StatValue>{dashboard?.stats.todayTrips}</StatValue>
            <StatLabel>Viagens Hoje</StatLabel>
          </StatCard>
          
          <StatCard>
            <IconBox bg={colors.orange[50]}>
              <Users size={18} color={colors.orange[600]} />
            </IconBox>
            <StatValue>{dashboard?.stats.passengers}</StatValue>
            <StatLabel>Passageiros</StatLabel>
          </StatCard>
        </Grid>

        <Grid>
          <StatCard>
            <IconBox bg={colors.green[50]}>
              <DollarSign size={18} color={colors.green[600]} />
            </IconBox>
            <StatValue>{dashboard?.stats.revenue}</StatValue>
            <StatLabel>Receita (Kz)</StatLabel>
          </StatCard>
        </Grid>

        {/* LISTA DE VIAGENS */}
        <SectionHeader>
          <SectionTitle>Próximas Partidas</SectionTitle>
          <Calendar size={20} color={colors.slate[400]} />
        </SectionHeader>

        {dashboard?.trips.map((trip) => (
          <TripItem key={trip.id} activeOpacity={0.7}>
            <TripTime>
              <TimeText>{trip.time}</TimeText>
              <DateText>Hoje</DateText>
            </TripTime>
            
            <TripInfo>
              <RouteText>{trip.origin} ➔ {trip.destination}</RouteText>
              <BusInfo>{trip.bus}</BusInfo>
            </TripInfo>

            <OccupancyBadge full={trip.isFull}>
              <OccupancyText full={trip.isFull}>{trip.seats}</OccupancyText>
            </OccupancyBadge>

            {/* Action Buttons */}
            <ActionButtons>
              <ActionButton 
                primary
                onPress={() => router.push(`/driver/manifest?tripId=${trip.id}`)}
                activeOpacity={0.7}
              >
                <FileText size={16} color={colors.white} />
              </ActionButton>
              <ActionButton 
                onPress={() => router.push(`/driver/check-in?tripId=${trip.id}`)}
                activeOpacity={0.7}
              >
                <CheckCircle2 size={16} color={colors.slate[600]} />
              </ActionButton>
            </ActionButtons>
            
            <ChevronRight size={16} color={colors.slate[300]} style={{ marginLeft: 8 }} />
          </TripItem>
        ))}

        <View style={{ height: 80 }} />
      </Content>

      {/* FAB SCANNER GLOBAL */}
      <FabButton onPress={() => router.push('/driver/check-in')}>
        <QrCode size={24} color={colors.white} />
        <View style={{position: 'absolute', top: -5, right: -5, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.red[500], borderWidth: 2, borderColor: colors.brand[600]}} />
      </FabButton>
    </Container>
    </OperatorGuard>
  );
}