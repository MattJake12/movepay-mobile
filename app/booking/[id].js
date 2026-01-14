// File: app/booking/[id].js

import React from 'react';
import { ScrollView, ImageBackground, View, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MapPin, 
  Clock, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  ChevronLeft, 
  Info,
  ArrowRight
} from 'lucide-react-native';
import api from '../../src/lib/api';
import { useCartStore } from '../../src/store/useCartStore';
import { colors, spacing, fontSize, fontWeight, shadows, borderRadius } from '../../src/theme/theme';

const formatKz = (v) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Content = styled(ScrollView)`
  flex: 1;
`;

// Hero Section Imersiva
const HeroContainer = styled.View`
  height: 320px;
  position: relative;
`;

const HeroImage = styled(ImageBackground)`
  width: 100%;
  height: 100%;
`;

const HeroGradient = styled(LinearGradient).attrs({
  colors: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(15, 23, 42, 1)'], // Slate-900 no fim
  locations: [0, 0.6, 1]
})`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  justify-content: flex-end;
  padding: ${spacing[6]}px;
`;

const HeaderNav = styled.View`
  position: absolute;
  top: ${spacing[12]}px;
  left: ${spacing[6]}px;
  z-index: 10;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
`;

// Tipografia Hero
const TripTag = styled.View`
  background-color: ${colors.brand[600]};
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 4px;
  align-self: flex-start;
  margin-bottom: ${spacing[2]}px;
`;

const TripTagText = styled.Text`
  color: ${colors.white};
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HeroTitle = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize['3xl']}px;
  font-weight: ${fontWeight.bold};
  margin-bottom: ${spacing[1]}px;
`;

const HeroSubtitle = styled.Text`
  color: ${colors.slate[300]};
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.medium};
`;

// Itinerary Section (Timeline Clean)
const SectionContainer = styled.View`
  padding: ${spacing[6]}px;
  background-color: ${colors.slate[50]};
`;

const ItineraryCard = styled.View`
  background-color: ${colors.white};
  border-radius: 16px;
  padding: ${spacing[5]}px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
  ${shadows.sm}
`;

const TimelineRow = styled.View`
  flex-direction: row;
  height: 60px; /* Altura fixa para alinhar a linha vertical */
`;

const TimeColumn = styled.View`
  width: 60px;
  align-items: flex-end;
  padding-right: ${spacing[3]}px;
`;

const TimeText = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const LineColumn = styled.View`
  width: 24px;
  align-items: center;
`;

const Dot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${props => props.color || colors.slate[300]};
  border-width: 2px;
  border-color: ${colors.white};
  z-index: 2;
`;

const Line = styled.View`
  width: 2px;
  background-color: ${colors.slate[200]};
  flex: 1;
  position: absolute;
  top: 10px;
  bottom: -10px;
  z-index: 1;
`;

const InfoColumn = styled.View`
  flex: 1;
  padding-left: ${spacing[2]}px;
`;

const LocationText = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[800]};
`;

const TerminalText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  margin-top: 2px;
`;

const DurationRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 84px; /* TimeColumn + LineColumn */
  margin-vertical: ${spacing[2]}px;
`;

const DurationBadge = styled.View`
  background-color: ${colors.slate[100]};
  padding-horizontal: 8px;
  padding-vertical: 2px;
  border-radius: 4px;
`;

const DurationText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[500]};
`;

// Features Grid (Technical Look)
const FeaturesTitle = styled.Text`
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${spacing[4]}px;
  margin-top: ${spacing[6]}px;
`;

const FeaturesGrid = styled.View`
  flex-direction: row;
  gap: ${spacing[3]}px;
`;

const FeatureBox = styled.View`
  flex: 1;
  background-color: ${colors.white};
  border-radius: 12px;
  padding: ${spacing[3]}px;
  align-items: center;
  border-width: 1px;
  border-color: ${colors.slate[200]};
`;

const FeatureLabel = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[600]};
  margin-top: ${spacing[2]}px;
  text-transform: uppercase;
`;

// Footer Sticky
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
`;

const PriceContainer = styled.View``;

const PriceLabel = styled.Text`
  font-size: 10px;
  color: ${colors.slate[500]};
  text-transform: uppercase;
  font-weight: ${fontWeight.bold};
`;

const PriceValue = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const BookButton = styled.TouchableOpacity`
  background-color: ${colors.brand[600]};
  padding-horizontal: ${spacing[8]}px;
  padding-vertical: ${spacing[4]}px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
  ${shadows.md}
`;

const BookButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const setCartTrip = useCartStore((state) => state.setTrip);

  console.log('📍 TripDetailsScreen - ID recebido:', id);

  // Mock data simulation (substitua pelo useQuery real)
  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip-detail', id],
    queryFn: async () => {
      try {
        console.log('🔄 Buscando trip com ID:', id);
        const res = await api.get(`/trips/${id}`);
        console.log('✅ Resposta da API:', res.data);
        return res.data.data;
      } catch (err) {
        console.error('❌ Erro ao buscar trip:', err.response?.data || err.message);
        throw err;
      }
    },
    enabled: !!id && id !== 'search-results', // Só executa se houver ID válido (não é rota de listagem)
    retry: 2, // Tenta 2 vezes
    retryDelay: 1000, // Aguarda 1s entre tentativas
  });

  const handleProceed = () => {
    if (trip) {
      setCartTrip(trip);
      router.push('/booking/select-seats');
    }
  };

  if (!id) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[6] }}>
          <View style={{ backgroundColor: colors.red[50], padding: spacing[6], borderRadius: 12, alignItems: 'center' }}>
            <Info size={24} color={colors.red[600]} style={{ marginBottom: spacing[2] }} />
            <TerminalText style={{ color: colors.red[600], textAlign: 'center', fontSize: fontSize.base }}>
              ID da viagem não foi passado
            </TerminalText>
          </View>
        </View>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand[600]} />
        </View>
      </Container>
    );
  }

  if (error || !trip) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[6] }}>
          <View style={{ backgroundColor: colors.red[50], padding: spacing[6], borderRadius: 12, alignItems: 'center' }}>
            <Info size={24} color={colors.red[600]} style={{ marginBottom: spacing[2] }} />
            <TerminalText style={{ color: colors.red[600], textAlign: 'center', fontSize: fontSize.base }}>
              {error?.message || 'Erro ao carregar detalhes da viagem'}
            </TerminalText>
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Content contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HERO */}
        <HeroContainer>
          <HeroImage source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop' }} resizeMode="cover">
            <HeroGradient>
              <TripTag>
                <TripTagText>Classe Executiva</TripTagText>
              </TripTag>
              <HeroTitle>{trip.origin} para {trip.destination}</HeroTitle>
              <HeroSubtitle>Operado por {trip.company.name}</HeroSubtitle>
            </HeroGradient>
          </HeroImage>
          
          <HeaderNav>
            <BackButton onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.white} />
            </BackButton>
          </HeaderNav>
        </HeroContainer>

        <SectionContainer>
          {/* TIMELINE */}
          <ItineraryCard>
            {/* Saída */}
            <TimelineRow>
              <TimeColumn>
                <TimeText>{new Date(trip.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</TimeText>
              </TimeColumn>
              <LineColumn>
                <Dot color={colors.brand[600]} />
                <Line />
              </LineColumn>
              <InfoColumn>
                <LocationText>{trip.origin}</LocationText>
                <TerminalText>Terminal Rodoviário A</TerminalText>
              </InfoColumn>
            </TimelineRow>

            {/* Duração Intermediária */}
            <DurationRow>
              <DurationBadge>
                <DurationText>⏱ 6h 30m de viagem</DurationText>
              </DurationBadge>
            </DurationRow>

            {/* Chegada */}
            <TimelineRow style={{ height: 'auto' }}>
              <TimeColumn>
                <TimeText>{new Date(trip.arrivalTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</TimeText>
              </TimeColumn>
              <LineColumn>
                <Dot color={colors.slate[900]} />
              </LineColumn>
              <InfoColumn>
                <LocationText>{trip.destination}</LocationText>
                <TerminalText>Terminal Central</TerminalText>
              </InfoColumn>
            </TimelineRow>
          </ItineraryCard>

          {/* AMENIDADES (Estilo Técnico) */}
          <FeaturesTitle>Especificações do Veículo</FeaturesTitle>
          <FeaturesGrid>
            <FeatureBox>
              <Wifi size={20} color={colors.brand[600]} />
              <FeatureLabel>Wi-Fi 5G</FeatureLabel>
            </FeatureBox>
            <FeatureBox>
              <Zap size={20} color={colors.brand[600]} />
              <FeatureLabel>Tomada USB</FeatureLabel>
            </FeatureBox>
            <FeatureBox>
              <ShieldCheck size={20} color={colors.brand[600]} />
              <FeatureLabel>Seguro</FeatureLabel>
            </FeatureBox>
          </FeaturesGrid>

          {/* INFO BOX */}
          <View style={{ marginTop: 24, flexDirection: 'row', gap: 12, backgroundColor: colors.blue[50], padding: 16, borderRadius: 12 }}>
            <Info size={20} color={colors.blue[600]} />
            <View style={{ flex: 1 }}>
              <FeatureLabel style={{ marginTop: 0, color: colors.blue[800] }}>Política de Cancelamento</FeatureLabel>
              <TerminalText style={{ color: colors.blue[600] }}>Reembolso total até 24h antes da partida.</TerminalText>
            </View>
          </View>

        </SectionContainer>
      </Content>

      {/* FOOTER */}
      <Footer>
        <PriceContainer>
          <PriceLabel>Total por pessoa</PriceLabel>
          <PriceValue>{formatKz(trip.price)}</PriceValue>
        </PriceContainer>
        <BookButton onPress={handleProceed}>
          <BookButtonText>Selecionar Lugar</BookButtonText>
          <ArrowRight size={20} color={colors.white} />
        </BookButton>
      </Footer>
    </Container>
  );
}