/**
 * 📊 RestaurantReports
 * 
 * Relatórios e análises de vendas
 * - Seletor de período (dia/semana/mês)
 * - Receita total
 * - Produtos mais vendidos
 * - Estatísticas detalhadas
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
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
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  padding: 20px 16px;
  padding-top: 40px;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: white;
`;

const PeriodSelector = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
`;

const PeriodButton = styled(TouchableOpacity)`
  padding: 8px 12px;
  border-radius: 6px;
  background-color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
`;

const PeriodButtonText = styled.Text`
  color: ${props => props.active ? '#2196F3' : 'white'};
  font-weight: bold;
  font-size: 12px;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

const Card = styled.View`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left-width: 4px;
  border-left-color: ${props => props.color || '#2196F3'};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const CardLabel = styled.Text`
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
`;

const CardValue = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #333;
`;

const CardSubvalue = styled.Text`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const StatsGrid = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatCard = styled.View`
  flex: 1;
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const StatValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const StatLabel = styled.Text`
  font-size: 10px;
  color: #999;
  text-align: center;
`;

const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-top: 20px;
  margin-bottom: 12px;
`;

const ProductItem = styled.View`
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ProductRank = styled.View`
  background-color: #2196F3;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

const ProductRankText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const ProductInfo = styled.View`
  flex: 1;
`;

const ProductName = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: #333;
`;

const ProductRevenue = styled.Text`
  font-size: 11px;
  color: #2196F3;
  margin-top: 4px;
`;

const ProductQuantity = styled.Text`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
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

const StatsList = styled.View`
  background-color: white;
  border-radius: 10px;
  padding: 12px;
`;

const StatItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const StatItemLabel = styled.Text`
  font-size: 12px;
  color: #666;
`;

const StatItemValue = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #333;
`;

const ActionButton = styled(TouchableOpacity)`
  background-color: #2196F3;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin-top: 20px;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

export default function RestaurantReports({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const { selectedPeriod, changePeriod, salesReport, salesLoading, refreshAll } =
    useRestaurantStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const periods = [
    { key: 'daily', label: 'Hoje' },
    { key: 'weekly', label: 'Esta Semana' },
    { key: 'monthly', label: 'Este Mês' }
  ];

  return (
    <Container>
      <Header>
        <HeaderTitle>📊 Relatórios de Vendas</HeaderTitle>
        <PeriodSelector>
          {periods.map(period => (
            <PeriodButton
              key={period.key}
              active={selectedPeriod === period.key}
              onPress={() => changePeriod(period.key)}
            >
              <PeriodButtonText active={selectedPeriod === period.key}>
                {period.label}
              </PeriodButtonText>
            </PeriodButton>
          ))}
        </PeriodSelector>
      </Header>

      <Content
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {salesLoading ? (
          <LoadingText>Carregando relatório...</LoadingText>
        ) : (
          <>
            <Card color="#4CAF50">
              <CardLabel>Receita Total</CardLabel>
              <CardValue>
                AOA {salesReport?.totalRevenue?.toLocaleString('pt-AO') || '0'}
              </CardValue>
              <CardSubvalue>
                Período: {selectedPeriod === 'daily'
                  ? 'Hoje'
                  : selectedPeriod === 'weekly'
                  ? 'Esta Semana'
                  : 'Este Mês'}
              </CardSubvalue>
            </Card>

            <StatsGrid>
              <StatCard>
                <StatValue>{salesReport?.totalOrders || 0}</StatValue>
                <StatLabel>Pedidos</StatLabel>
              </StatCard>

              <StatCard>
                <StatValue>
                  {salesReport?.averageOrderValue
                    ? `AOA ${Math.round(salesReport.averageOrderValue)}`
                    : 'AOA 0'}
                </StatValue>
                <StatLabel>Ticket Médio</StatLabel>
              </StatCard>
            </StatsGrid>

            {salesReport?.topProducts && salesReport.topProducts.length === 0 && (
              <AlertBox>
                <Ionicons name="alert-circle" size={20} color="#ffc107" />
                <AlertText>
                  Nenhuma venda registrada neste período.
                </AlertText>
              </AlertBox>
            )}

            {salesReport?.topProducts && salesReport.topProducts.length > 0 && (
              <>
                <SectionTitle>⭐ Produtos Mais Vendidos</SectionTitle>
                {salesReport.topProducts.map((product, index) => (
                  <ProductItem key={product.id}>
                    <ProductRank>
                      <ProductRankText>#{index + 1}</ProductRankText>
                    </ProductRank>
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductRevenue>
                        AOA {product.revenue?.toLocaleString('pt-AO') || '0'}
                      </ProductRevenue>
                      <ProductQuantity>
                        {product.quantity} {product.quantity === 1 ? 'venda' : 'vendas'}
                      </ProductQuantity>
                    </ProductInfo>
                  </ProductItem>
                ))}
              </>
            )}

            {salesReport && (
              <>
                <SectionTitle>📈 Estatísticas Detalhadas</SectionTitle>
                <StatsList>
                  {salesReport.totalOrders !== undefined && (
                    <StatItem>
                      <StatItemLabel>Total de Pedidos</StatItemLabel>
                      <StatItemValue>{salesReport.totalOrders}</StatItemValue>
                    </StatItem>
                  )}

                  {salesReport.totalRevenue !== undefined && (
                    <StatItem>
                      <StatItemLabel>Receita Total</StatItemLabel>
                      <StatItemValue>
                        AOA {salesReport.totalRevenue?.toLocaleString('pt-AO')}
                      </StatItemValue>
                    </StatItem>
                  )}

                  {salesReport.averageOrderValue !== undefined && (
                    <StatItem>
                      <StatItemLabel>Ticket Médio</StatItemLabel>
                      <StatItemValue>
                        AOA {Math.round(salesReport.averageOrderValue).toLocaleString('pt-AO')}
                      </StatItemValue>
                    </StatItem>
                  )}

                  {salesReport.topProducts && (
                    <StatItem>
                      <StatItemLabel>Produtos Vendidos</StatItemLabel>
                      <StatItemValue>
                        {salesReport.topProducts.reduce((sum, p) => sum + p.quantity, 0)}
                      </StatItemValue>
                    </StatItem>
                  )}
                </StatsList>
              </>
            )}

            <ActionButton onPress={() => navigation?.goBack()}>
              <ActionButtonText>← Voltar ao Dashboard</ActionButtonText>
            </ActionButton>
          </>
        )}
      </Content>
    </Container>
  );
}
