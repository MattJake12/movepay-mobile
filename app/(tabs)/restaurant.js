// File: app/(tabs)/restaurant.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChefHat, 
  Utensils, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  Settings,
  BellRing
} from 'lucide-react-native';

// Hooks e Serviços
import { useRestaurantStats } from '../../src/hooks/useRestaurantStats';
import { useOrderManagement } from '../../src/hooks/useOrderManagement'; // Para KDS preview
import { colors, spacing, fontSize, fontWeight, shadows, borderRadius } from '../../src/theme/theme';

// ============================================================================
// 1. STYLED COMPONENTS (PREMIUM UI)
// ============================================================================

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

// --- HEADER ---
const HeaderContainer = styled.View`
  overflow: hidden;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  background-color: ${colors.orange[600]};
  ${shadows.md}
`;

const HeaderGradient = styled(LinearGradient).attrs({
  colors: [colors.orange[600], colors.red[600]],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  padding: ${spacing[6]}px;
  padding-top: ${Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60}px;
  padding-bottom: ${spacing[8]}px;
`;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[6]}px;
`;

const RestaurantName = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.extrabold};
  color: ${colors.white};
  letter-spacing: -0.5px;
`;

const StatusBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  padding-horizontal: 12px;
  padding-vertical: 6px;
  border-radius: 20px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.3);
`;

const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.isOpen ? colors.emerald[400] : colors.slate[400]};
`;

const StatusText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.xs}px;
  text-transform: uppercase;
`;

// --- KPI CARDS (GRID) ---
const StatsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: ${spacing[4]}px;
  margin-top: -40px; /* Sobrepor o header */
  gap: ${spacing[3]}px;
`;

const StatCard = styled.View`
  flex: 1;
  min-width: 45%;
  background-color: ${colors.white};
  border-radius: 20px;
  padding: ${spacing[4]}px;
  ${shadows.sm};
  border-width: 1px;
  border-color: ${colors.slate[100]};
  justify-content: space-between;
`;

const StatIconBox = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background-color: ${props => props.bg};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[3]}px;
`;

const StatValue = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.black};
  color: ${colors.slate[900]};
  letter-spacing: -1px;
`;

const StatLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[500]};
  text-transform: uppercase;
  margin-top: 4px;
`;

// --- ACTION BUTTONS (BIG) ---
const ActionsSection = styled.View`
  padding: ${spacing[4]}px;
  gap: ${spacing[4]}px;
`;

const SectionTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  margin-left: ${spacing[2]}px;
  margin-bottom: ${spacing[2]}px;
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.white};
  padding: ${spacing[5]}px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
  ${shadows.sm}
`;

const ActionIconContainer = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${props => props.bg};
  align-items: center;
  justify-content: center;
  margin-right: ${spacing[4]}px;
`;

const ActionInfo = styled.View`
  flex: 1;
`;

const ActionTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const ActionDesc = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[500]};
  margin-top: 2px;
`;

const AlertBadge = styled.View`
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: ${colors.red[500]};
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: ${colors.white};
`;

const AlertCount = styled.Text`
  color: ${colors.white};
  font-size: 10px;
  font-weight: ${fontWeight.bold};
`;

// --- LIVE ORDERS PREVIEW ---
const LiveSection = styled.View`
  padding: ${spacing[4]}px;
  padding-bottom: 100px;
`;

const OrderPreviewCard = styled.View`
  background-color: ${colors.white};
  padding: ${spacing[4]}px;
  border-radius: 16px;
  margin-bottom: ${spacing[3]}px;
  border-left-width: 4px;
  border-left-color: ${props => props.color};
  ${shadows.sm}
`;

const OrderHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing[2]}px;
`;

const OrderId = styled.Text`
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[800]};
`;

const TimeElapsed = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${props => props.late ? colors.red[500] : colors.slate[500]};
`;

const OrderItemText = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${colors.slate[700]};
  font-weight: ${fontWeight.medium};
`;

// --- LOADING STATE ---
const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${colors.slate[50]};
`;

// ============================================================================
// 2. MAIN COMPONENT LOGIC
// ============================================================================

export default function RestaurantScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // 1. Hook de Stats Gerais (KPIs, Receita, Top Produto)
  const { 
    dashboard, 
    dashboardLoading, 
    error: statsError, 
    refreshAll 
  } = useRestaurantStats();

  // 2. Hook de Pedidos (Para contagem em tempo real e preview)
  const { 
    activeOrders, 
    refetchOrders 
  } = useOrderManagement();

  // Refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshAll(), refetchOrders()]);
    setRefreshing(false);
  }, [refreshAll, refetchOrders]);

  // Formatação de Moeda
  const formatKz = (val) => 
    new Intl.NumberFormat('pt-AO', { 
      style: 'currency', 
      currency: 'AOA', 
      minimumFractionDigits: 0 
    }).format(val || 0);

  // Calcular Alertas
  const pendingCount = activeOrders.filter(o => o.snackStatus === 'PENDING').length;
  const preparingCount = activeOrders.filter(o => o.snackStatus === 'PREPARING').length;
  const needsAttention = pendingCount > 0;

  // Estado de Carregamento Inicial
  if (dashboardLoading && !refreshing) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color={colors.orange[600]} />
        <Text style={{ marginTop: 16, color: colors.slate[500], fontWeight: 'bold' }}>
          A abrir o restaurante...
        </Text>
      </LoadingContainer>
    );
  }

  // Se houver erro crítico
  if (statsError) {
    Alert.alert("Erro", statsError);
  }

  return (
    <Container>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.orange[600]}
          />
        }
      >
        {/* === HEADER === */}
        <HeaderContainer>
          <HeaderGradient>
            <TopRow>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Gestão
                </Text>
                <RestaurantName>{dashboard?.restaurant || 'Meu Restaurante'}</RestaurantName>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Configurações', 'Ajustes do restaurante em breve.')}>
                <Settings color={colors.white} size={24} />
              </TouchableOpacity>
            </TopRow>

            <StatusBadge>
              <StatusDot isOpen={dashboard?.status === 'Aberto'} />
              <StatusText>{dashboard?.status || 'Fechado'}</StatusText>
            </StatusBadge>
          </HeaderGradient>
        </HeaderContainer>

        {/* === KPI CARDS === */}
        <StatsContainer>
          {/* Pedidos Ativos */}
          <StatCard>
            <View>
              <StatIconBox bg={colors.orange[100]}>
                <BellRing size={20} color={colors.orange[600]} />
              </StatIconBox>
              <StatValue>{dashboard?.activeOrders || 0}</StatValue>
            </View>
            <StatLabel>Pedidos Ativos</StatLabel>
          </StatCard>

          {/* Vendas Hoje */}
          <StatCard>
            <View>
              <StatIconBox bg={colors.emerald[100]}>
                <DollarSign size={20} color={colors.emerald[600]} />
              </StatIconBox>
              <StatValue style={{ fontSize: 20 }}>{formatKz(dashboard?.revenueToday)}</StatValue>
            </View>
            <StatLabel>Vendas Hoje</StatLabel>
          </StatCard>

          {/* Pedidos Totais */}
          <StatCard>
            <View>
              <StatIconBox bg={colors.blue[100]}>
                <CheckCircle2 size={20} color={colors.blue[600]} />
              </StatIconBox>
              <StatValue>{dashboard?.ordersToday || 0}</StatValue>
            </View>
            <StatLabel>Entregues</StatLabel>
          </StatCard>

          {/* Top Produto */}
          <StatCard>
            <View>
              <StatIconBox bg={colors.purple[100]}>
                <TrendingUp size={20} color={colors.purple[600]} />
              </StatIconBox>
              <StatValue style={{ fontSize: 16 }}>{dashboard?.topProduct?.quantity || 0}</StatValue>
            </View>
            <StatLabel numberOfLines={1}>{dashboard?.topProduct?.name || '-'}</StatLabel>
          </StatCard>
        </StatsContainer>

        {/* === ALERTA DE COZINHA === */}
        {needsAttention && (
          <View style={{ paddingHorizontal: spacing[4], marginTop: spacing[4] }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: colors.red[50], 
              padding: 12, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.red[200] 
            }}>
              <AlertTriangle size={20} color={colors.red[600]} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.red[800], fontWeight: 'bold' }}>Atenção Necessária</Text>
                <Text style={{ color: colors.red[600], fontSize: 12 }}>
                  Existem {pendingCount} novos pedidos aguardando confirmação.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* === AÇÕES PRINCIPAIS === */}
        <ActionsSection>
          <SectionTitle>Acesso Rápido</SectionTitle>

          {/* KDS Button */}
          <ActionButton onPress={() => router.push('/restaurant/orders')} activeOpacity={0.7}>
            <ActionIconContainer bg={colors.orange[100]}>
              <ChefHat size={28} color={colors.orange[600]} />
            </ActionIconContainer>
            <ActionInfo>
              <ActionTitle>Cozinha (KDS)</ActionTitle>
              <ActionDesc>Gerir fila de preparação em tempo real</ActionDesc>
            </ActionInfo>
            {activeOrders.length > 0 && (
              <AlertBadge>
                <AlertCount>{activeOrders.length}</AlertCount>
              </AlertBadge>
            )}
          </ActionButton>

          {/* Menu Button */}
          <ActionButton onPress={() => router.push('/restaurant/menu')} activeOpacity={0.7}>
            <ActionIconContainer bg={colors.emerald[100]}>
              <Utensils size={28} color={colors.emerald[600]} />
            </ActionIconContainer>
            <ActionInfo>
              <ActionTitle>Cardápio</ActionTitle>
              <ActionDesc>Editar produtos, preços e fotos</ActionDesc>
            </ActionInfo>
          </ActionButton>

          {/* Reports Button */}
          <ActionButton onPress={() => router.push('/restaurant/reports')} activeOpacity={0.7}>
            <ActionIconContainer bg={colors.blue[100]}>
              <BarChart3 size={28} color={colors.blue[600]} />
            </ActionIconContainer>
            <ActionInfo>
              <ActionTitle>Relatórios</ActionTitle>
              <ActionDesc>Histórico de vendas e performance</ActionDesc>
            </ActionInfo>
          </ActionButton>
        </ActionsSection>

        {/* === PRÉ-VISUALIZAÇÃO DA FILA (Live Preview) === */}
        {activeOrders.length > 0 && (
          <LiveSection>
            <SectionTitle>Na Fila ({activeOrders.length})</SectionTitle>
            {activeOrders.slice(0, 3).map((order) => (
              <OrderPreviewCard 
                key={order.id}
                color={order.snackStatus === 'PENDING' ? colors.red[500] : colors.amber[500]}
              >
                <OrderHeader>
                  <OrderId>#{order.id.slice(0, 5).toUpperCase()}</OrderId>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={colors.slate[500]} />
                    <TimeElapsed late={order.timeWaitingMs > 15 * 60000}>
                      {Math.floor(order.timeWaitingMs / 60000)} min
                    </TimeElapsed>
                  </View>
                </OrderHeader>
                <OrderItemText>{order.snack?.name}</OrderItemText>
                <Text style={{ fontSize: 10, color: colors.slate[500], marginTop: 4, textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {order.snackStatus === 'PENDING' ? 'Aguardando' : 'Em Preparo'}
                </Text>
              </OrderPreviewCard>
            ))}
            {activeOrders.length > 3 && (
              <TouchableOpacity onPress={() => router.push('/restaurant/orders')}>
                <Text style={{ textAlign: 'center', color: colors.brand[600], fontWeight: 'bold', marginTop: 8 }}>
                  Ver mais {activeOrders.length - 3} pedidos...
                </Text>
              </TouchableOpacity>
            )}
          </LiveSection>
        )}

      </ScrollView>
    </Container>
  );
}