import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, User, Phone, CheckCircle2, Circle, MoreVertical, AlertCircle } from 'lucide-react-native';
import { useDriverOperations } from '../../src/hooks/useDriverOperations';
import { OperatorGuard } from '../../src/components/OperatorGuard';
import { colors, spacing, fontSize, fontWeight, shadows, borderRadius } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled(SafeAreaView)`
  flex: 1; 
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  padding: 16px; 
  background-color: ${colors.white}; 
  border-bottom-width: 1px; 
  border-color: ${colors.slate[100]};
`;

const HeaderTop = styled.View`
  flex-direction: row; 
  align-items: center; 
  justify-content: space-between; 
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 20px; 
  font-weight: bold; 
  color: ${colors.slate[900]};
`;

const Subtitle = styled.Text`
  font-size: 12px; 
  color: ${colors.slate[500]};
`;

const SearchBar = styled.View`
  flex-direction: row; 
  align-items: center; 
  background-color: ${colors.slate[100]}; 
  border-radius: 12px; 
  padding-horizontal: 12px; 
  height: 48px;
  margin-bottom: 12px;
`;

const SearchInput = styled.TextInput`
  flex: 1; 
  margin-left: 8px; 
  font-size: 16px; 
  color: ${colors.slate[900]};
`;

const StatRow = styled.View`
  flex-direction: row; 
  padding: 12px 16px; 
  gap: 12px;
`;

const StatCard = styled.TouchableOpacity`
  flex: 1; 
  background-color: ${props => props.active ? colors.brand[600] : colors.white}; 
  padding: 12px; 
  border-radius: 12px; 
  border-width: 1px; 
  border-color: ${props => props.active ? colors.brand[600] : colors.slate[200]};
  ${shadows.sm}
`;

const StatValue = styled.Text`
  font-size: 20px; 
  font-weight: bold; 
  color: ${props => props.active ? colors.white : colors.slate[900]};
`;

const StatLabel = styled.Text`
  font-size: 10px; 
  font-weight: bold; 
  text-transform: uppercase; 
  color: ${props => props.active ? colors.brand[100] : colors.slate[500]};
  margin-top: 4px;
`;

const PassengerCard = styled.TouchableOpacity`
  flex-direction: row; 
  align-items: center; 
  background-color: ${colors.white}; 
  padding: 16px; 
  margin-horizontal: 16px; 
  margin-bottom: 8px; 
  border-radius: 12px;
  border-left-width: 4px; 
  border-left-color: ${props => props.boarded ? colors.emerald[500] : colors.slate[300]};
  ${shadows.sm}
`;

const SeatBox = styled.View`
  width: 40px; 
  height: 40px; 
  border-radius: 8px; 
  background-color: ${colors.slate[100]}; 
  align-items: center; 
  justify-content: center; 
  margin-right: 12px;
`;

const SeatText = styled.Text`
  font-size: 16px; 
  font-weight: bold; 
  color: ${colors.slate[900]};
`;

const InfoBox = styled.View`
  flex: 1;
`;

const Name = styled.Text`
  font-size: 16px; 
  font-weight: 600; 
  color: ${colors.slate[900]};
`;

const Detail = styled.Text`
  font-size: 12px; 
  color: ${colors.slate[500]}; 
  margin-top: 2px;
`;

const CheckBox = styled.TouchableOpacity`
  padding: 8px;
  align-items: center;
  justify-content: center;
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const EmptyContainer = styled.View`
  align-items: center;
  margin-top: 40px;
`;

const ErrorContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.red[50]};
  padding: 16px;
  margin: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${colors.red[200]};
`;

const ErrorText = styled.Text`
  flex: 1;
  margin-left: 12px;
  color: ${colors.red[700]};
  font-size: 14px;
  font-weight: 500;
`;

export default function ManifestScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const { manifest, isLoading, error, toggleCheckIn, isCheckingIn } = useDriverOperations(tripId);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, BOARDED, PENDING

  const passengers = manifest?.passengers || [];

  // Estatísticas Calculadas
  const stats = useMemo(() => {
    const total = passengers.length;
    const boarded = passengers.filter(p => p.status === 'USED').length;
    const pending = total - boarded;
    return { total, boarded, pending };
  }, [passengers]);

  // Filtro de Lista
  const filteredList = useMemo(() => {
    return passengers.filter(p => {
      const matchesSearch = 
        (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
        (p.seat && p.seat.toString().includes(search));
      
      const matchesFilter = 
        filter === 'ALL' || 
        (filter === 'BOARDED' && p.status === 'USED') ||
        (filter === 'PENDING' && p.status === 'VALID');
      
      return matchesSearch && matchesFilter;
    });
  }, [passengers, search, filter]);

  const renderItem = ({ item }) => {
    const isBoarded = item.status === 'USED';
    return (
      <PassengerCard 
        boarded={isBoarded} 
        onPress={() => toggleCheckIn(item.ticketId || item.id)}
        disabled={isCheckingIn}
        activeOpacity={0.7}
      >
        <SeatBox>
          <SeatText>{item.seat}</SeatText>
        </SeatBox>
        <InfoBox>
          <Name>{item.name}</Name>
          <Detail>{item.phone} • BI: {item.biNumber || 'N/A'}</Detail>
        </InfoBox>
        <CheckBox onPress={() => toggleCheckIn(item.ticketId || item.id)} disabled={isCheckingIn}>
          {isBoarded 
            ? <CheckCircle2 size={28} color={colors.emerald[500]} fill={colors.emerald[100]} />
            : <Circle size={28} color={colors.slate[300]} />
          }
        </CheckBox>
      </PassengerCard>
    );
  };

  if (isLoading) {
    return (
      <OperatorGuard>
        <Container>
          <LoadingContainer>
            <ActivityIndicator size="large" color={colors.brand[600]} />
          </LoadingContainer>
        </Container>
      </OperatorGuard>
    );
  }

  return (
    <OperatorGuard>
    <Container>
      <Header>
        <HeaderTop>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={24} color={colors.slate[900]} />
          </TouchableOpacity>
          <View>
            <Title>Lista de Passageiros</Title>
            <Subtitle>{manifest?.trip?.totalSeats} Assentos • {manifest?.trip?.confirmedPassengers} Confirmados</Subtitle>
          </View>
          <TouchableOpacity>
            <MoreVertical size={24} color={colors.slate[900]} />
          </TouchableOpacity>
        </HeaderTop>

        <SearchBar>
          <Search size={20} color={colors.slate[400]} />
          <SearchInput
            placeholder="Buscar por nome ou assento..."
            placeholderTextColor={colors.slate[400]}
            value={search}
            onChangeText={setSearch}
          />
        </SearchBar>
      </Header>

      {error && (
        <ErrorContainer>
          <AlertCircle size={20} color={colors.red[600]} />
          <ErrorText>{error?.message || 'Erro ao carregar manifesto'}</ErrorText>
        </ErrorContainer>
      )}

      <StatRow>
        <StatCard 
          active={filter === 'ALL'} 
          onPress={() => setFilter('ALL')}
          activeOpacity={0.7}
        >
          <StatValue active={filter === 'ALL'}>{stats.total}</StatValue>
          <StatLabel active={filter === 'ALL'}>Total</StatLabel>
        </StatCard>
        <StatCard 
          active={filter === 'BOARDED'} 
          onPress={() => setFilter('BOARDED')}
          activeOpacity={0.7}
        >
          <StatValue active={filter === 'BOARDED'} style={{ color: colors.emerald[600] }}>
            {stats.boarded}
          </StatValue>
          <StatLabel active={filter === 'BOARDED'}>Embarcados</StatLabel>
        </StatCard>
        <StatCard 
          active={filter === 'PENDING'} 
          onPress={() => setFilter('PENDING')}
          activeOpacity={0.7}
        >
          <StatValue active={filter === 'PENDING'} style={{ color: colors.orange[600] }}>
            {stats.pending}
          </StatValue>
          <StatLabel active={filter === 'PENDING'}>Faltam</StatLabel>
        </StatCard>
      </StatRow>

      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item?.ticketId || item?.id || index).toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        scrollEnabled={true}
        ListEmptyComponent={
          <EmptyContainer>
            <User size={48} color={colors.slate[300]} />
            <Subtitle style={{ marginTop: 12, fontSize: 14 }}>
              {search ? 'Nenhum passageiro encontrado' : 'Nenhum passageiro nesta viagem'}
            </Subtitle>
          </EmptyContainer>
        }
      />
    </Container>
    </OperatorGuard>
  );
}
