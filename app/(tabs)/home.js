// File: app/(tabs)/home.js

import React, { useState, useEffect } from 'react';
import { 
  RefreshControl, 
  StatusBar, 
  ScrollView, 
  View, 
  Text, 
  Platform, 
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MapPin, 
  Calendar, 
  Bell, 
  SlidersHorizontal, 
  ArrowRight, 
  Sparkles,
  ChevronDown,
  Bus,
  Car,
  Package,
  Search as SearchIcon
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Imports Locais
import { RecommendedFeed } from '../../src/components/home/RecommendedFeed';
import { TabContent } from '../../src/components/home/TabContent';
import { 
  colors, 
  spacing, 
  fontSize, 
  fontWeight, 
  shadows, 
  borderRadius, 
  letterSpacing 
} from '../../src/theme/theme';
import { useUserStore } from '../../src/store/useUserStore';
import { useFilterStore } from '../../src/store/useFilterStore';

const { width } = Dimensions.get('window');

// ==========================================
// 1. STYLED COMPONENTS (PREMIUM UI)
// ==========================================

const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[25]};
`;

// --- HEADER SECTION ---

const HeaderContainer = styled.View`
  height: 290px;
  background-color: ${colors.brand[900]};
  border-bottom-left-radius: ${borderRadius['2xl']}px;
  border-bottom-right-radius: ${borderRadius['2xl']}px;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

const HeaderGradient = styled(LinearGradient).attrs({
  colors: [colors.gradientStart, colors.gradientEnd],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  flex: 1;
  padding-top: ${Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50}px;
  padding-horizontal: ${spacing[6]}px;
`;

const TopBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[6]}px;
`;

const GreetingBox = styled.View`
  flex: 1;
`;

const DateText = styled.Text`
  color: ${colors.brand[200]};
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wider}px;
  margin-bottom: 4px;
`;

const GreetingText = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.bold};
`;

const UserName = styled.Text`
  color: ${colors.brand[100]}; 
`;

const NotificationBtn = styled.TouchableOpacity`
  width: 46px;
  height: 46px;
  border-radius: ${borderRadius.full}px;
  background-color: rgba(255, 255, 255, 0.15);
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
`;

const BadgeDot = styled.View`
  position: absolute;
  top: 11px;
  right: 12px;
  width: 9px;
  height: 9px;
  border-radius: 5px;
  background-color: ${colors.danger[500]};
  border-width: 1.5px;
  border-color: ${colors.brand[800]};
`;

// --- SEARCH WIDGET (FLOATING) ---

// CORREÇÃO: Usamos .attrs para passar a sombra como estilo puro
// Isso evita o erro de "unitless" e "Node of type rule"
const FloatingWidget = styled.View.attrs({
  style: shadows.lg 
})`
  background-color: ${colors.white};
  margin-horizontal: ${spacing[6]}px;
  margin-top: -90px; 
  border-radius: ${borderRadius.xl}px;
  padding: ${spacing[5]}px;
  z-index: 10;
`;

const TabRow = styled.View`
  flex-direction: row;
  background-color: ${colors.slate[50]};
  padding: 4px;
  border-radius: ${borderRadius.lg}px;
  margin-bottom: ${spacing[5]}px;
`;

const TabButton = styled.TouchableOpacity.attrs(props => ({
  style: props.active ? shadows.sm : undefined
}))`
  flex: 1;
  flex-direction: row;
  gap: 6px;
  padding-vertical: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.active ? colors.white : 'transparent'};
  border-radius: ${borderRadius.md}px;
`;

const TabLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${props => props.active ? fontWeight.bold : fontWeight.medium};
  color: ${props => props.active ? colors.brand[600] : colors.slate[500]};
`;

// Container visual para os inputs conectados
const InputGroup = styled.View`
  border-width: 1px;
  border-color: ${colors.slate[100]};
  border-radius: ${borderRadius.lg}px;
  background-color: ${colors.slate[50]};
  overflow: hidden;
  margin-bottom: ${spacing[4]}px;
`;

const InputRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${spacing[4]}px;
  background-color: ${colors.white};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${colors.slate[100]};
  margin-left: 50px; 
`;

const IconContainer = styled.View`
  width: 32px;
  align-items: center;
  margin-right: ${spacing[3]}px;
`;

const InputTexts = styled.View`
  flex: 1;
`;

const Label = styled.Text`
  font-size: 10px;
  color: ${colors.slate[400]};
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wide}px;
  margin-bottom: 2px;
`;

const Value = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${props => props.placeholder ? colors.slate[400] : colors.slate[900]};
  font-weight: ${fontWeight.bold};
`;

// Botão Primário com "Glow" (CORRIGIDO)
const SearchButton = styled(LinearGradient).attrs({
  colors: [colors.gradientStart, colors.gradientEnd],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
  style: shadows.glow // Aplica sombra via style prop
})`
  height: 56px;
  border-radius: ${borderRadius.lg}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing[1]}px;
`;

const SearchButtonText = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  margin-right: ${spacing[2]}px;
`;

// --- SECTIONS ---

const SectionHeader = styled.View`
  padding-horizontal: ${spacing[6]}px;
  margin-top: ${spacing[8]}px;
  margin-bottom: ${spacing[4]}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.Text`
  font-size: ${fontSize.xl}px;
  font-weight: ${fontWeight.black};
  color: ${colors.slate[900]};
  letter-spacing: -0.5px;
`;

// ==========================================
// 2. COMPONENT LOGIC
// ==========================================

export default function HomeScreen() {
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const hydrateUser = useUserStore(state => state.hydrate);
  const filters = useFilterStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('bus'); // bus, rental, cargo

  // Verificar se há filtros ativos
  const hasActiveFilters = 
    filters.busClass !== 'ALL' || 
    filters.timeOfDay.length > 0 || 
    filters.companies.length > 0 || 
    filters.minRating > 0 || 
    filters.maxDuration !== null || 
    filters.minPrice > 0 || 
    filters.maxPrice < 1000000;

  // Data atual formatada (Ex: Domingo, 04 Jan)
  // Nota: Verifique se 'pt-AO' é suportado no dispositivo, senão use 'pt-PT'
  const today = new Date().toLocaleDateString('pt-PT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short' 
  }).replace('.', ''); 

  useEffect(() => {
    console.log('🏠 [Home] Mounted. Check user state:', user ? 'LOGGED IN' : 'NULL');
    if(user) console.log('🏠 [Home] User Name:', user.name);
    
    hydrateUser().then(() => {
        console.log('🏠 [Home] Hydration complete');
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await hydrateUser();
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleSearchPress = () => {
    router.push('/booking/search-results');
  };

  // Helper para ícones da Tab
  const getTabIcon = (tabName, isActive) => {
    const color = isActive ? colors.brand[600] : colors.slate[400];
    const size = 16;
    if (tabName === 'bus') return <Bus size={size} color={color} />;
    if (tabName === 'rental') return <Car size={size} color={color} />;
    if (tabName === 'cargo') return <Package size={size} color={color} />;
  };

  return (
    <Container>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.brand[900]} 
        translucent={true}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.brand[600]} 
            colors={[colors.brand[600]]} 
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* === HEADER === */}
        <HeaderContainer>
          <HeaderGradient>
            <TopBar>
              <GreetingBox>
                <DateText>{today}</DateText>
                <GreetingText>
                  Olá, <UserName>{user?.name?.split(' ')[0] || 'Viajante'}</UserName>
                </GreetingText>
              </GreetingBox>
              
              <NotificationBtn onPress={() => router.push('/notifications')} activeOpacity={0.7}>
                <Bell size={22} color={colors.white} strokeWidth={2} />
                <BadgeDot />
              </NotificationBtn>
            </TopBar>
          </HeaderGradient>
        </HeaderContainer>

        {/* === FLOATING SEARCH WIDGET === */}
        <FloatingWidget>
          {/* Tabs */}
          <TabRow>
            {['bus', 'rental', 'cargo'].map((tab) => (
              <TabButton 
                key={tab}
                active={activeTab === tab} 
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                {getTabIcon(tab, activeTab === tab)}
                <TabLabel active={activeTab === tab}>
                  {tab === 'bus' ? 'Viagens' : tab === 'rental' ? 'Aluguer' : 'Cargas'}
                </TabLabel>
              </TabButton>
            ))}
          </TabRow>

          {/* Connected Inputs */}
          <InputGroup>
            {/* Linha visual conectando os ícones (Hack Visual) */}
            <View style={{ position: 'absolute', left: 30, top: 38, bottom: 38, width: 2, backgroundColor: colors.slate[100], zIndex: 1 }} />

            {/* Origem */}
            <InputRow onPress={handleSearchPress} activeOpacity={0.7}>
              <IconContainer style={{ zIndex: 2, backgroundColor: 'white' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand[500], borderWidth: 2, borderColor: colors.brand[200] }} />
              </IconContainer>
              <InputTexts>
                <Label>Partindo de</Label>
                <Value numberOfLines={1}>Luanda, AO</Value>
              </InputTexts>
            </InputRow>

            <Divider />

            {/* Destino */}
            <InputRow onPress={handleSearchPress} activeOpacity={0.7}>
              <IconContainer style={{ zIndex: 2, backgroundColor: 'white' }}>
                 <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.slate[400] }} />
              </IconContainer>
              <InputTexts>
                <Label>Indo para</Label>
                <Value placeholder>Selecionar destino</Value>
              </InputTexts>
            </InputRow>
          </InputGroup>

          {/* Data Input (Separado) */}
          <View style={{ 
            borderRadius: borderRadius.lg, 
            backgroundColor: colors.slate[50], 
            marginBottom: spacing[5],
            borderWidth: 1,
            borderColor: colors.slate[100],
            overflow: 'hidden'
          }}>
            <InputRow onPress={handleSearchPress} activeOpacity={0.7} style={{ backgroundColor: 'transparent' }}>
              <IconContainer>
                <Calendar size={20} color={colors.slate[500]} />
              </IconContainer>
              <InputTexts>
                <Label>Data da Viagem</Label>
                <Value>Hoje, {new Date().getDate()} de {new Date().toLocaleDateString('pt-PT', { month: 'short' })}</Value>
              </InputTexts>
              <ChevronDown size={16} color={colors.slate[400]} />
            </InputRow>
          </View>

          {/* CTA Button */}
          <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.85}>
            <SearchButton>
              <SearchButtonText>Pesquisar Opções</SearchButtonText>
              <ArrowRight size={20} color={colors.white} strokeWidth={2.5} />
            </SearchButton>
          </TouchableOpacity>
        </FloatingWidget>

        {/* === CARGO TRACKING SECTION === */}
        {activeTab === 'cargo' && (
          <View style={{ paddingHorizontal: spacing[6], marginBottom: spacing[6] }}>
            <SectionTitle style={{ marginBottom: spacing[4] }}>Rastrear Encomenda</SectionTitle>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                const code = prompt('Digite o código de rastreamento (ex: MP-PKG-8842):');
                if (code) {
                  router.push(`/cargo/${code.trim().toUpperCase()}`);
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[3],
                backgroundColor: colors.white,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: colors.slate[100],
                ...shadows.sm
              }}
            >
              <SearchIcon size={20} color={colors.brand[600]} />
              <Text style={{
                flex: 1,
                marginLeft: spacing[3],
                color: colors.slate[500],
                fontSize: fontSize.base
              }}>
                Código de rastreamento...
              </Text>
              <ArrowRight size={20} color={colors.brand[600]} />
            </TouchableOpacity>
          </View>
        )}

        {/* === RECOMMENDATIONS SECTION === */}
        <SectionHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SectionTitle>Sugestões Premium</SectionTitle>
            <Sparkles size={18} color={colors.warning[500]} fill={colors.warning[500]} />
          </View>
        </SectionHeader>
        
        {/* Componente Horizontal */}
        <RecommendedFeed />

        {/* === MAIN CONTENT (AVAILABLE) === */}
        <SectionHeader style={{ marginTop: spacing[6] }}>
          <View>
            <SectionTitle>Disponíveis Agora</SectionTitle>
            <Text style={{ color: colors.slate[400], fontSize: fontSize.xs, marginTop: 2 }}>
              Ofertas recentes para {activeTab === 'bus' ? 'viajar' : activeTab === 'rental' ? 'alugar' : 'enviar'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(modals)/filter')}
            style={{ 
              padding: 8, 
              backgroundColor: colors.white, 
              borderRadius: 8,
              position: 'relative'
            }}
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
          </TouchableOpacity>
        </SectionHeader>
        
        {/* Componente Vertical */}
        <TabContent tab={activeTab} />

      </ScrollView>
    </Container>
  );
}