// File: app/booking/search-results.js

import React, { useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components/native';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Clock, Users, SlidersHorizontal } from 'lucide-react-native';
import api from '../../src/lib/api';
import { useFilterStore } from '../../src/store/useFilterStore';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';
import { useSocket } from '../../src/hooks/useSocket';
import { useToast } from '../../src/hooks/useToast';

const formatKz = (v) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing[6]}px;
  padding-top: ${spacing[4]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[200]};
  flex-direction: row;
  align-items: center;
  gap: ${spacing[3]}px;
`;

const HeaderTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  flex: 1;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${colors.slate[100]};
  justify-content: center;
  align-items: center;
`;

const FilterButton = styled.TouchableOpacity`
  padding: ${spacing[2]}px;
  background-color: ${colors.slate[100]};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`;

const TripCard = styled.TouchableOpacity`
  background-color: ${colors.white};
  margin: ${spacing[3]}px ${spacing[4]}px;
  padding: ${spacing[4]}px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
  ${shadows.sm}
`;

const RouteText = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  margin-bottom: ${spacing[2]}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
  margin-bottom: ${spacing[2]}px;
`;

const InfoText = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[600]};
`;

const PriceText = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.brand[600]};
  margin-top: ${spacing[2]}px;
`;

const SeatsText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing[6]}px;
`;

const EmptyText = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${colors.slate[500]};
  text-align: center;
`;

export default function SearchResultsScreen() {
  const router = useRouter();
  const { origin, destination, date } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { socket } = useSocket(); // Sem namespace específico
  const { showToast } = useToast();
  const filters = useFilterStore();

  // Verificar se há filtros ativos
  const hasActiveFilters = 
    filters.busClass !== 'ALL' || 
    filters.timeOfDay.length > 0 || 
    filters.companies.length > 0 || 
    filters.minRating > 0 || 
    filters.maxDuration !== null || 
    filters.minPrice > 0 || 
    filters.maxPrice < 1000000;

  const { data: trips, isLoading, error, refetch } = useQuery({
    queryKey: ['trips', origin, destination, date, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (origin) params.append('origin', origin);
      if (destination) params.append('destination', destination);
      if (date) params.append('date', date);

      // Adicionando filtros do store (Backend Pagination/Filter)
      if (typeof filters.minPrice === 'number' && filters.minPrice > 0) params.append('minPrice', filters.minPrice);
      if (typeof filters.maxPrice === 'number' && filters.maxPrice < 1000000) params.append('maxPrice', filters.maxPrice);
      if (filters.busClass && filters.busClass !== 'ALL') params.append('busClass', filters.busClass);
      if (filters.timeOfDay && filters.timeOfDay.length > 0) params.append('timeOfDay', filters.timeOfDay.join(','));
      if (filters.companies && filters.companies.length > 0) params.append('companies', filters.companies.join(','));
      if (filters.minRating > 0) params.append('minRating', filters.minRating);
      if (filters.maxDuration) params.append('maxDuration', filters.maxDuration);
      
      const res = await api.get(`/trips?${params.toString()}`);
      return res.data.data || [];
    }
  });

  // Listener para novas viagens em tempo real
  React.useEffect(() => {
    if (!socket) return;

    const handleNewTrip = (newTrip) => {
      console.log('📡 Nova viagem detectada:', newTrip);

      // Verificar se a nova viagem corresponde à pesquisa atual
      // 1. Verificar Origem e Destino (case insensitive)
      const isSameRoute = 
        (!origin || newTrip.origin.toLowerCase().includes(origin.toLowerCase())) &&
        (!destination || newTrip.destination.toLowerCase().includes(destination.toLowerCase()));

      // 2. Verificar Data (se o usuário filtrou por data)
      let isSameDate = true;
      if (date) {
        const tripDate = new Date(newTrip.departureTime).toISOString().split('T')[0];
        const searchDate = new Date(date).toISOString().split('T')[0]; // date string "YYYY-MM-DD"
        isSameDate = tripDate === searchDate;
      }

      if (isSameRoute && isSameDate) {
        // Atualizar a lista silenciosamente
        refetch(); // Recarrega os dados da API
        showToast.success('Uma nova viagem foi adicionada agora!'); // Feedback não-intrusivo
      }
    };

    socket.on('trip:created', handleNewTrip);

    return () => {
      socket.off('trip:created', handleNewTrip);
    };
  }, [socket, origin, destination, date, refetch, showToast]);

  const handleTripPress = (tripId) => {
    router.push(`/booking/${tripId}`);
  };

  const filteredTrips = trips;

  if (isLoading) {
    return (
      <Container>
        <Header>
          <BackButton onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.slate[600]} />
          </BackButton>
          <HeaderTitle>Resultados da Busca</HeaderTitle>
        </Header>
        <EmptyContainer>
          <ActivityIndicator size="large" color={colors.brand[600]} />
        </EmptyContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.slate[600]} />
        </BackButton>
        <HeaderTitle>
          {filteredTrips?.length || 0} {(filteredTrips?.length === 1) ? 'Viagem' : 'Viagens'}
        </HeaderTitle>
        {/* ✅ MISSÃO 2A: Botão de Filtro com ícone SlidersHorizontal */}
        <FilterButton 
          onPress={() => router.push('/(modals)/filter')}
          style={{ position: 'relative' }}
        >
          <SlidersHorizontal size={20} color={hasActiveFilters ? colors.brand[600] : colors.slate[700]} />
          {hasActiveFilters && (
            <View style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.brand[600],
              borderWidth: 1.5,
              borderColor: colors.white
            }} />
          )}
        </FilterButton>
      </Header>

      {filteredTrips && filteredTrips.length > 0 ? (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing[6] }}
          renderItem={({ item }) => (
            <TripCard onPress={() => handleTripPress(item.id)}>
              <RouteText>
                {item.origin} → {item.destination}
              </RouteText>

              <InfoRow>
                <Clock size={16} color={colors.slate[500]} />
                <InfoText>
                  {new Date(item.departureTime).toLocaleTimeString('pt-AO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {' '}
                  (
                  {new Date(item.arrivalTime).toLocaleTimeString('pt-AO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  )
                </InfoText>
              </InfoRow>

              <InfoRow>
                <MapPin size={16} color={colors.slate[500]} />
                <InfoText>{item.company?.name || 'Operadora desconhecida'}</InfoText>
              </InfoRow>

              <InfoRow>
                <Users size={16} color={colors.slate[500]} />
                <SeatsText>
                  {item.availableSeats} {(item.availableSeats === 1) ? 'lugar' : 'lugares'} disponível{(item.availableSeats === 1) ? '' : 'is'}
                </SeatsText>
              </InfoRow>

              <PriceText>{formatKz(item.price)}</PriceText>
            </TripCard>
          )}
        />
      ) : (
        <EmptyContainer>
          <EmptyText>Nenhuma viagem encontrada.{'\n'}Tente outros filtros.</EmptyText>
        </EmptyContainer>
      )}
    </Container>
  );
}
