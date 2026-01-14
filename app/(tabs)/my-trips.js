// File: app/(tabs)/my-trips.js

import React, { useState, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ticket as TicketIcon } from 'lucide-react-native';
import api from '../../src/lib/api';
import { TicketCard } from '../../src/components/cards/TicketCard';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  padding: ${spacing[6]}px;
  background-color: ${colors.slate[50]};
`;

const Title = styled.Text`
  font-size: ${fontSize['3xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  margin-bottom: ${spacing[6]}px;
`;

// Toggle Moderno (Segmented Control)
const ToggleContainer = styled.View`
  flex-direction: row;
  background-color: ${colors.slate[200]};
  border-radius: 12px;
  padding: 4px;
`;

const ToggleButton = styled.Pressable.attrs(props => ({
  style: props.active ? shadows.sm : undefined
}))`
  flex: 1;
  padding-vertical: 8px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.active ? colors.white : 'transparent'};
`;

const ToggleText = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
  color: ${props => props.active ? colors.slate[900] : colors.slate[500]};
`;

// Empty State
const EmptyContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding-top: 60px;
  opacity: 0.7;
`;

const IconCircle = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${colors.slate[100]};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[4]}px;
`;

const EmptyTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[800]};
  margin-bottom: ${spacing[2]}px;
`;

const EmptyText = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[500]};
  text-align: center;
  max-width: 250px;
  line-height: 20px;
`;

export default function MyTripsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const res = await api.get('/bookings/my-tickets');
      return res.data.data;
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    const now = new Date();
    return tickets.filter(ticket => {
      const tripDate = new Date(ticket.trip.departureTime);
      if (activeTab === 'upcoming') {
        return tripDate >= now && ticket.status !== 'CANCELLED';
      } else {
        return tripDate < now || ticket.status === 'CANCELLED';
      }
    });
  }, [tickets, activeTab]);

  return (
    <Container>
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Header>
            <Title>Minhas Viagens</Title>
            <ToggleContainer>
              <ToggleButton 
                active={activeTab === 'upcoming'} 
                onPress={() => setActiveTab('upcoming')}
              >
                <ToggleText active={activeTab === 'upcoming'}>Próximas</ToggleText>
              </ToggleButton>
              <ToggleButton 
                active={activeTab === 'history'} 
                onPress={() => setActiveTab('history')}
              >
                <ToggleText active={activeTab === 'history'}>Histórico</ToggleText>
              </ToggleButton>
            </ToggleContainer>
          </Header>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <EmptyContainer>
            <IconCircle>
              <TicketIcon size={32} color={colors.slate[400]} />
            </IconCircle>
            <EmptyTitle>Sem viagens aqui</EmptyTitle>
            <EmptyText>
              {activeTab === 'upcoming' 
                ? "Você ainda não tem viagens agendadas. Que tal explorar novos destinos?" 
                : "Seu histórico de viagens aparecerá aqui."}
            </EmptyText>
          </EmptyContainer>
        )}
        renderItem={({ item }) => (
          <TicketCard 
            ticket={item} 
            onPress={() => router.push({ pathname: '/(modals)/ticket-detail', params: { id: item.id } })}
            showQrAction={activeTab === 'upcoming'}
          />
        )}
      />
    </Container>
  );
}