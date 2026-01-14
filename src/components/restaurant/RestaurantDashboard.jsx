/**
 * 🏪 RestaurantDashboard
 * 
 * Dashboard principal do gerenciador de restaurante
 * - KPIs (pedidos, vendas, receita, cardápio)
 * - Botões de ação rápida
 * - Produto mais vendido
 * - Alertas de performance
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert
} from 'react-native';
import styled from 'styled-components/native';
import { useRestaurantStats } from '../../hooks';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  background: linear-gradient(135deg, #ff6b35 0%, #ee5a1f 100%);
  padding: 20px 16px;
  padding-top: 40px;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: white;
`;

const HeaderSubtitle = styled.Text`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

const KPIGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const KPICard = styled.View`
  flex: 1;
  min-width: 48%;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  border-left-width: 4px;
  border-left-color: ${props => props.color || '#4CAF50'};
`;

const KPILabel = styled.Text`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const KPIValue = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #333;
`;

const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-top: 20px;
  margin-bottom: 12px;
`;

const ActionButtonsContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-bottom: 20px;
`;

const ActionButton = styled(TouchableOpacity)`
  flex: 1;
  background-color: ${props => props.color};
  border-radius: 10px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
`;

const ProductCard = styled.View`
  background: linear-gradient(135deg, #ffd700 0%, #ffc700 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const ProductLabel = styled.Text`
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
`;

const ProductName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

const ProductStats = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const ProductStat = styled.View`
  align-items: center;
`;

const ProductStatValue = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const ProductStatLabel = styled.Text`
  font-size: 10px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
`;

const AlertBox = styled.View`
  background-color: #fff3cd;
  border-left-width: 4px;
  border-left-color: #ffc107;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const AlertText = styled.Text`
  flex: 1;
  color: #856404;
  font-size: 12px;
`;

const LoadingText = styled.Text`
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 20px;
`;

export default function RestaurantDashboard({ navigation }) {
  const { dashboard, dashboardLoading, error, refreshAll } = useRestaurantStats();

  useEffect(() => {
    if (error) {
      Alert.alert('Erro', error);
    }
  }, [error]);

  const onRefresh = async () => {
    await refreshAll();
  };

  const activeOrders = dashboard?.activeOrders || 0;
  const hasAlerts = activeOrders > 5;

  return (
    <Container>
      <Header>
        <HeaderTitle>{dashboard?.restaurant}</HeaderTitle>
        <HeaderSubtitle>
          Status: {dashboard?.status ? '🟢 Aberto' : '🔴 Fechado'}
        </HeaderSubtitle>
      </Header>

      <Content
        refreshControl={
          <RefreshControl refreshing={dashboardLoading} onRefresh={onRefresh} />
        }
      >
        {dashboardLoading ? (
          <LoadingText>Carregando dashboard...</LoadingText>
        ) : (
          <>
            <KPIGrid>
              <KPICard color="#ff6b35">
                <KPILabel>Pedidos Ativos</KPILabel>
                <KPIValue>{activeOrders}</KPIValue>
              </KPICard>

              <KPICard color="#4CAF50">
                <KPILabel>Hoje</KPILabel>
                <KPIValue>{dashboard?.ordersToday || 0}</KPIValue>
              </KPICard>

              <KPICard color="#2196F3">
                <KPILabel>Receita</KPILabel>
                <KPIValue>
                  {dashboard?.revenueToday
                    ? `AOA ${(dashboard.revenueToday / 1000).toFixed(1)}K`
                    : 'AOA 0'}
                </KPIValue>
              </KPICard>

              <KPICard color="#9C27B0">
                <KPILabel>Cardápio</KPILabel>
                <KPIValue>{dashboard?.menuCount || 0}</KPIValue>
              </KPICard>
            </KPIGrid>

            {hasAlerts && (
              <AlertBox>
                <Ionicons name="alert-circle" size={20} color="#ffc107" />
                <AlertText>
                  Você tem {activeOrders} pedidos ativos. Acelere a preparação!
                </AlertText>
              </AlertBox>
            )}

            <SectionTitle>⚡ Ações Rápidas</SectionTitle>
            <ActionButtonsContainer>
              <ActionButton
                color="#ff6b35"
                onPress={() => navigation?.navigate('Orders')}
              >
                <Ionicons name="timer-outline" size={18} color="white" />
                <ActionButtonText>Pedidos{'\n'}na Fila</ActionButtonText>
              </ActionButton>

              <ActionButton
                color="#4CAF50"
                onPress={() => navigation?.navigate('Menu')}
              >
                <Ionicons name="list-outline" size={18} color="white" />
                <ActionButtonText>Editar{'\n'}Cardápio</ActionButtonText>
              </ActionButton>

              <ActionButton
                color="#2196F3"
                onPress={() => navigation?.navigate('Reports')}
              >
                <Ionicons name="bar-chart-outline" size={18} color="white" />
                <ActionButtonText>Ver{'\n'}Vendas</ActionButtonText>
              </ActionButton>
            </ActionButtonsContainer>

            {dashboard?.topProduct && (
              <>
                <SectionTitle>⭐ Produto Mais Vendido</SectionTitle>
                <ProductCard>
                  <ProductLabel>Top 1</ProductLabel>
                  <ProductName>{dashboard.topProduct.name}</ProductName>
                  <ProductStats>
                    <ProductStat>
                      <ProductStatValue>{dashboard.topProduct.quantity}</ProductStatValue>
                      <ProductStatLabel>Vendidas</ProductStatLabel>
                    </ProductStat>
                    <ProductStat>
                      <ProductStatValue>
                        AOA {dashboard.topProduct.price?.toLocaleString('pt-AO')}
                      </ProductStatValue>
                      <ProductStatLabel>Preço</ProductStatLabel>
                    </ProductStat>
                  </ProductStats>
                </ProductCard>
              </>
            )}
          </>
        )}
      </Content>
    </Container>
  );
}
