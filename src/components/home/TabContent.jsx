// File: src/components/home/TabContent.jsx

import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MapPin, 
  Wifi, 
  Wind, 
  Package, 
  Car, 
  ArrowRight,
  AlertCircle,
  Star,
  Search,
  Truck
} from 'lucide-react-native';
import styled from 'styled-components/native';

// Hooks e Tema
import { useTrips } from '../../hooks/useTrips'; 
import { useFilterStore } from '../../store/useFilterStore';
import { 
  colors, 
  spacing, 
  fontSize, 
  fontWeight, 
  borderRadius, 
  shadows 
} from '../../theme/theme';

const { width } = Dimensions.get('window');

// ==========================================
// 1. STYLED COMPONENTS (PREMIUM & BUG-FREE)
// ==========================================

const Container = styled.View`
  flex: 1;
  padding-horizontal: ${spacing[6]}px;
  padding-bottom: ${spacing[8]}px;
`;

// --- CARD GENÉRICO (CORRIGIDO) ---
// Usamos .attrs para aplicar a sombra via style prop.
// Isso resolve o erro "Node of type rule not supported as an inline style"
const Card = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
  style: {
    ...shadows.sm, // Sombra suave definida no theme
    marginBottom: spacing[4]
  }
})`
  background-color: ${colors.white};
  border-radius: ${borderRadius.xl}px;
  padding: ${spacing[4]}px;
  border-width: 1px;
  border-color: ${colors.slate[100]};
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing[3]}px;
`;

const CompanyInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const CompanyLogoPlaceholder = styled.View`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.sm}px;
  background-color: ${colors.brand[50]};
  align-items: center;
  justify-content: center;
`;

const CompanyName = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[600]};
  font-weight: ${fontWeight.semibold};
`;

const RatingBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: ${colors.warning[50]};
  padding-horizontal: 6px;
  padding-vertical: 3px;
  border-radius: 6px;
`;

const RatingText = styled.Text`
  font-size: 11px;
  font-weight: ${fontWeight.bold};
  color: ${colors.warning[700]};
`;

// --- ROUTE & TIME SECTION ---

const RouteContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[4]}px;
`;

const TimeColumn = styled.View`
  align-items: flex-start;
`;

const TimeText = styled.Text`
  font-size: ${fontSize.xl}px;
  font-weight: ${fontWeight.black};
  color: ${colors.slate[900]};
  letter-spacing: -0.5px;
`;

const RouteVisual = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${spacing[2]}px;
`;

const RouteLine = styled.View`
  height: 1px;
  flex: 1;
  background-color: ${colors.slate[200]};
  margin-horizontal: 8px;
`;

const DurationBadge = styled.View`
  background-color: ${colors.slate[50]};
  padding-horizontal: 6px;
  padding-vertical: 2px;
  border-radius: 4px;
`;

const DurationText = styled.Text`
  font-size: 9px;
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.bold};
`;

const LocationText = styled.Text`
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.medium};
  color: ${colors.slate[500]};
`;

// --- FOOTER & PRICE ---

const Divider = styled.View`
  height: 1px;
  background-color: ${colors.slate[50]};
  margin-vertical: ${spacing[3]}px;
`;

const CardFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AmenitiesRow = styled.View`
  flex-direction: row;
  gap: ${spacing[2]}px;
`;

const AmenityBadge = styled.View`
  padding-horizontal: 8px;
  padding-vertical: 4px;
  background-color: ${colors.slate[50]};
  border-radius: ${borderRadius.sm}px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const AmenityText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[600]};
`;

const PriceContainer = styled.View`
  align-items: flex-end;
`;

const PriceLabel = styled.Text`
  font-size: 10px;
  color: ${colors.slate[400]};
  text-transform: uppercase;
  font-weight: ${fontWeight.bold};
`;

const PriceValue = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.black};
  color: ${colors.brand[600]};
`;

// --- SEATS BADGE ---

const SeatsBadge = styled.View`
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: ${borderRadius.full}px;
  background-color: ${props => props.low ? colors.danger[50] : colors.success[50]};
  border-width: 1px;
  border-color: ${props => props.low ? colors.danger[100] : colors.success[100]};
`;

const SeatsText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  color: ${props => props.low ? colors.danger[600] : colors.success[600]};
`;

// --- STATES (Loading, Error, Empty) ---

const CenterState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: ${spacing[8]}px;
  padding-bottom: ${spacing[8]}px;
  min-height: 250px;
`;

const IconCircle = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${colors.slate[50]};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[4]}px;
  border-width: 1px;
  border-color: ${colors.slate[100]};
`;

const StateTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  margin-bottom: ${spacing[2]}px;
`;

const StateDesc = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[500]};
  text-align: center;
  max-width: 250px;
  line-height: 20px;
`;

// ==========================================
// 2. COMPONENT LOGIC
// ==========================================

export function TabContent({ tab }) {
  const router = useRouter();
  
  // Mapear aba para o tipo de API
  const getTripType = () => {
    switch (tab) {
      case 'bus': return 'BUS';
      case 'rental': return 'RENTAL';
      case 'cargo': return 'CARGO';
      default: return 'BUS';
    }
  };

  // Hook Data
  const { data: trips, isLoading, error } = useTrips({}, getTripType());
  const filters = useFilterStore();

  const filteredData = React.useMemo(() => {
    if (!trips) return [];
    
    return trips.filter(item => {
      // 1. Class Filter
      if (filters && filters.busClass !== 'ALL') {
          const itemClass = item.class || item.type;
          if (itemClass && itemClass.toUpperCase() !== filters.busClass) return false;
      }

      // 2. Time Filter
      if (filters && filters.timeOfDay.length > 0 && item.departureTime) {
        const date = new Date(item.departureTime);
        const hour = date.getHours();
        const matchesTime = 
            (filters.timeOfDay.includes('morning') && hour >= 6 && hour < 12) ||
            (filters.timeOfDay.includes('afternoon') && hour >= 12 && hour < 18) ||
            (filters.timeOfDay.includes('night') && (hour >= 18 || hour < 6));
        if (!matchesTime) return false;
      }

      // 3. Company Filter
      if (filters && filters.companies.length > 0) {
        const compId = item.companyId || (item.company && item.company.id);
        if (compId && !filters.companies.includes(compId)) return false;
      }

      // 4. Rating Filter
      if (filters && filters.minRating > 0) {
        const rating = item.rating || (item.company && item.company.rating) || 0;
        if (rating < filters.minRating) return false;
      }

      // 5. Duration Filter
      if (filters && filters.maxDuration && item.departureTime && item.arrivalTime) {
         const depTime = new Date(item.departureTime);
         const arrTime = new Date(item.arrivalTime); 
         if (!isNaN(depTime) && !isNaN(arrTime)) {
            const durationHours = (arrTime - depTime) / 3600000;
            if (durationHours > filters.maxDuration) return false;
         }
      }

      // 6. Price Filter
      const itemPrice = Number(item.price || 0);
      if (filters && typeof filters.minPrice === 'number' && filters.minPrice > 0) {
        if (itemPrice < filters.minPrice) return false;
      }
      if (filters && typeof filters.maxPrice === 'number' && filters.maxPrice < 1000000) {
        if (itemPrice > filters.maxPrice) return false;
      }

      return true;
    });
  }, [trips, filters]);

  // 1. Loading
  if (isLoading) {
    return (
      <CenterState>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={{ marginTop: 16, color: colors.slate[400], fontSize: 12, fontWeight: 'bold' }}>
          CARREGANDO OFERTAS...
        </Text>
      </CenterState>
    );
  }

  // 2. Error
  if (error) {
    return (
      <CenterState>
        <IconCircle>
          <AlertCircle size={32} color={colors.danger[500]} />
        </IconCircle>
        <StateTitle>Erro de Conexão</StateTitle>
        <StateDesc>Não foi possível carregar as viagens. Verifique sua internet.</StateDesc>
      </CenterState>
    );
  }

  // 3. Empty State (Personalizado por aba)
  if (filteredData.length === 0) {
    const emptyConfig = {
      bus: { 
        title: 'Sem viagens hoje', 
        desc: 'Tente mudar a data ou a rota para encontrar passagens.', 
        icon: <MapPin size={32} color={colors.slate[300]} /> 
      },
      rental: { 
        title: 'Veículos indisponíveis', 
        desc: 'Todos os carros desta categoria já foram reservados.', 
        icon: <Car size={32} color={colors.slate[300]} /> 
      },
      cargo: { 
        title: 'Serviço temporário', 
        desc: 'O envio de cargas não está disponível nesta rota hoje.', 
        icon: <Package size={32} color={colors.slate[300]} /> 
      },
    }[tab] || { 
      title: 'Nada encontrado', 
      desc: 'Tente alterar os filtros.', 
      icon: <Search size={32} color={colors.slate[300]} /> 
    };

    return (
      <CenterState>
        <IconCircle>{emptyConfig.icon}</IconCircle>
        <StateTitle>{emptyConfig.title}</StateTitle>
        <StateDesc>{emptyConfig.desc}</StateDesc>
      </CenterState>
    );
  }

  // 4. Render Items
  const renderItem = ({ item }) => {
    // Formatação segura
    const price = Number(item.price || 0).toLocaleString('pt-AO');
    const seatsAvailable = item.seatsAvailable || item.availableSeats || 0;
    const isLowSeats = seatsAvailable < 10;
    
    const handlePress = () => {
      // Diferenciar fluxo de ACORDO com a aba
      if (tab === 'bus') {
        // Fluxo de COMPRA: Vai para detalhes da viagem/reserva
        router.push(`/booking/${item.id}`);
      } else {
        // Outros fluxos (rent, cargo) - mantemos o modal por enquanto ou ajustamos depois
        router.push({
          pathname: '/(modals)/ticket-detail',
          params: {
            tripId: item.id, // Aqui passamos o ID correto
            origin: item.origin,
            destination: item.destination,
            price: item.price,
            type: tab
          }
        });
      }
    };

    // --- CARD DE VIAGENS (BUS) ---
    if (tab === 'bus') {
      const depTime = new Date(item.departureTime || Date.now());
      const arrTime = new Date(item.arrivalTime || depTime.getTime() + 14400000); // +4h mock
      
      const durationMs = arrTime - depTime;
      const hours = Math.floor(durationMs / 3600000);
      const mins = Math.round((durationMs % 3600000) / 60000);
      const duration = `${hours}h ${mins > 0 ? mins + 'm' : ''}`;

      return (
        <Card onPress={handlePress}>
          <CardHeader>
            <CompanyInfo>
              {item.company?.logo ? (
                <Image source={{ uri: item.company.logo }} style={{ width: 32, height: 32, borderRadius: 8 }} />
              ) : (
                <CompanyLogoPlaceholder>
                  <Text style={{ fontWeight: 'bold', color: colors.brand[600] }}>
                    {(item.company?.name || 'TP').substring(0,2).toUpperCase()}
                  </Text>
                </CompanyLogoPlaceholder>
              )}
              <CompanyName>{item.company?.name || 'Viação Expresso'}</CompanyName>
            </CompanyInfo>
            <RatingBadge>
              <Star size={10} color={colors.warning[600]} fill={colors.warning[600]} />
              <RatingText>4.8</RatingText>
            </RatingBadge>
          </CardHeader>

          <RouteContainer>
            <TimeColumn>
              <TimeText>{depTime.toLocaleTimeString('pt-AO', { hour:'2-digit', minute:'2-digit' })}</TimeText>
              <LocationText>{item.origin || 'Luanda'}</LocationText>
            </TimeColumn>

            <RouteVisual>
              <RouteLine />
              <DurationBadge>
                <DurationText>{duration}</DurationText>
              </DurationBadge>
              <RouteLine />
              <ArrowRight size={14} color={colors.slate[300]} style={{ position: 'absolute', right: -4 }} />
            </RouteVisual>

            <TimeColumn style={{ alignItems: 'flex-end' }}>
              <TimeText style={{ color: colors.slate[500], fontSize: fontSize.lg }}>
                {arrTime.toLocaleTimeString('pt-AO', { hour:'2-digit', minute:'2-digit' })}
              </TimeText>
              <LocationText style={{ textAlign: 'right' }}>{item.destination || 'Huambo'}</LocationText>
            </TimeColumn>
          </RouteContainer>

          <Divider />

          <CardFooter>
            <AmenitiesRow>
              <AmenityBadge>
                <Wifi size={10} color={colors.slate[500]} />
                <AmenityText>Wi-Fi</AmenityText>
              </AmenityBadge>
              <AmenityBadge>
                <Wind size={10} color={colors.slate[500]} />
                <AmenityText>AC</AmenityText>
              </AmenityBadge>
              {isLowSeats && (
                <SeatsBadge low>
                  <SeatsText low>Restam {seatsAvailable}</SeatsText>
                </SeatsBadge>
              )}
            </AmenitiesRow>

            <PriceContainer>
              <PriceLabel>por passageiro</PriceLabel>
              <PriceValue>Kz {price}</PriceValue>
            </PriceContainer>
          </CardFooter>
        </Card>
      );
    }

    // --- CARD DE ALUGUEL (RENTAL) ---
    if (tab === 'rental') {
      return (
        <Card onPress={handlePress}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
             {/* Imagem Placeholder ou Real */}
             <View style={{ width: 100, height: 90, backgroundColor: colors.slate[50], borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? (
                   <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                ) : (
                   <Car size={40} color={colors.slate[300]} />
                )}
             </View>
             
             {/* Info */}
             <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 2 }}>
                <View>
                  <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.slate[900] }}>
                    {item.model || 'Toyota Fortuner'}
                  </Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.slate[500], marginTop: 2 }}>
                    {item.type || 'SUV'} • Automático • 2023
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                   <RatingBadge>
                      <Star size={10} color={colors.warning[600]} fill={colors.warning[600]} />
                      <RatingText>5.0</RatingText>
                   </RatingBadge>
                   <PriceContainer>
                     <PriceLabel>diária</PriceLabel>
                     <PriceValue>Kz {price}</PriceValue>
                   </PriceContainer>
                </View>
             </View>
          </View>
        </Card>
      );
    }

    // --- CARD DE CARGAS (CARGO) ---
    if (tab === 'cargo') {
      return (
        <Card onPress={handlePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center' }}>
               <Truck size={24} color={colors.brand[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.slate[900] }}>
                Logística Express
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.slate[500], marginTop: 2 }}>
                {item.origin || 'Luanda'} ➔ {item.destination || 'Benguela'}
              </Text>
            </View>
            <PriceContainer>
              <PriceLabel>base</PriceLabel>
              <PriceValue style={{ fontSize: fontSize.base }}>Kz {price}</PriceValue>
            </PriceContainer>
          </View>
          <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
            <AmenityBadge>
              <Package size={10} color={colors.slate[500]} />
              <AmenityText>Até 50kg</AmenityText>
            </AmenityBadge>
            <AmenityBadge>
              <Text style={{ fontSize: 10, color: colors.success[600], fontWeight: 'bold' }}>• Entrega em 24h</Text>
            </AmenityBadge>
          </View>
        </Card>
      );
    }

    return null;
  };

  return (
    <Container>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => String(item.id || Math.random())}
        renderItem={renderItem}
        scrollEnabled={false} // Scroll controlado pelo pai (home.js)
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
      />
    </Container>
  );
}