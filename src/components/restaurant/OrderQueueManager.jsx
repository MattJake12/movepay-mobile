/**
 * 🍳 OrderQueueManager (KDS - Kitchen Display System)
 * 
 * Gerenciamento de fila de pedidos para cozinha
 * - Fila FIFO (primeiro que entra, primeiro que sai)
 * - Timer de espera
 * - Status visual
 * - Botões de transição de status
 * - Cancelamento com justificativa
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import styled from 'styled-components/native';
import { useOrderManagement } from '../../hooks';
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

const Content = styled.FlatList`
  flex: 1;
  padding: 12px;
`;

const OrderCard = styled.View`
  background-color: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  border-left-width: 5px;
  border-left-color: ${props => {
    switch (props.status) {
      case 'PENDING':
        return '#f44336';
      case 'PREPARING':
        return '#ffc107';
      case 'READY':
        return '#4CAF50';
      default:
        return '#999';
    }
  }};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const OrderHeader = styled.View`
  padding: 12px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const OrderId = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const StatusBadge = styled.View`
  background-color: ${props => {
    switch (props.status) {
      case 'PENDING':
        return '#f44336';
      case 'PREPARING':
        return '#ffc107';
      case 'READY':
        return '#4CAF50';
      default:
        return '#999';
    }
  }};
  padding: 4px 10px;
  border-radius: 12px;
`;

const StatusText = styled.Text`
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const OrderBody = styled.View`
  padding: 12px;
`;

const OrderItem = styled.View`
  margin-bottom: 10px;
`;

const ItemLabel = styled.Text`
  font-size: 10px;
  color: #999;
  margin-bottom: 2px;
`;

const ItemValue = styled.Text`
  font-size: 13px;
  color: #333;
  font-weight: bold;
`;

const ItemRow = styled.View`
  flex-direction: row;
  gap: 16px;
  margin-bottom: 10px;
`;

const ItemColumn = styled.View`
  flex: 1;
`;

const SnackName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const SnackPrice = styled.Text`
  font-size: 12px;
  color: #2196F3;
  margin-top: 4px;
`;

const DeliveryBadge = styled.View`
  background-color: ${props => props.pickup ? '#e3f2fd' : '#f3e5f5'};
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
  align-self: flex-start;
`;

const DeliveryText = styled.Text`
  font-size: 10px;
  color: ${props => props.pickup ? '#1976D2' : '#7B1FA2'};
  font-weight: bold;
`;

const TimerContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background-color: #fff3e0;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 10px;
`;

const TimerText = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #e65100;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
  border-top-width: 1px;
  border-top-color: #eee;
  padding-top: 12px;
`;

const ActionButton = styled(TouchableOpacity)`
  flex: 1;
  background-color: ${props => props.color};
  padding: 10px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-size: 11px;
  font-weight: bold;
  margin-top: 4px;
`;

const CancelButton = styled(TouchableOpacity)`
  padding: 8px;
  background-color: #ffebee;
  border-radius: 6px;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 30px;
`;

// Timer Hook
const useTimer = (createdAt) => {
  const [timeWaiting, setTimeWaiting] = useState('0m 0s');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const created = new Date(createdAt);
      const diff = Math.floor((now - created) / 1000);
      
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      
      setTimeWaiting(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return timeWaiting;
};

const OrderTimer = ({ createdAt }) => {
  const timeWaiting = useTimer(createdAt);
  
  return (
    <TimerContainer>
      <Ionicons name="timer-outline" size={14} color="#e65100" />
      <TimerText>{timeWaiting}</TimerText>
    </TimerContainer>
  );
};

export default function OrderQueueManager() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    activeOrders,
    ordersLoading,
    updateOrderStatus,
    moveToPreparation,
    moveToReady,
    moveToDelivered,
    cancelOrder,
    refetchOrders
  } = useOrderManagement();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchOrders();
    setRefreshing(false);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      if (newStatus === 'PREPARING') {
        await moveToPreparation(ticketId);
      } else if (newStatus === 'READY') {
        await moveToReady(ticketId);
      } else if (newStatus === 'DELIVERED') {
        await moveToDelivered(ticketId);
      }
      await refetchOrders();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleCancel = (order) => {
    Alert.prompt(
      'Cancelar Pedido',
      `Cancelar pedido de ${order.user?.name}?\nInforme o motivo:`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async (reason) => {
            try {
              await cancelOrder(order.id, reason || 'Cancelado pelo gerente');
              await refetchOrders();
              Alert.alert('Sucesso', 'Pedido cancelado');
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const renderOrderCard = ({ item: order }) => (
    <OrderCard status={order.snackStatus}>
      <OrderHeader>
        <OrderId>#{order.id.slice(0, 8).toUpperCase()}</OrderId>
        <StatusBadge status={order.snackStatus}>
          <StatusText>{order.snackStatus}</StatusText>
        </StatusBadge>
      </OrderHeader>

      <OrderBody>
        <OrderItem>
          <ItemLabel>Lanche</ItemLabel>
          <SnackName>{order.snack?.name}</SnackName>
          <SnackPrice>AOA {order.snack?.price?.toLocaleString('pt-AO')}</SnackPrice>
        </OrderItem>

        <ItemRow>
          <ItemColumn>
            <ItemLabel>Cliente</ItemLabel>
            <ItemValue>{order.user?.name || 'N/A'}</ItemValue>
          </ItemColumn>
          <ItemColumn>
            <ItemLabel>Telefone</ItemLabel>
            <ItemValue>{order.user?.phone || 'N/A'}</ItemValue>
          </ItemColumn>
        </ItemRow>

        <OrderItem>
          <ItemLabel>Entrega</ItemLabel>
          <DeliveryBadge pickup={order.deliveryMethod === 'PICKUP_COUNTER'}>
            <DeliveryText pickup={order.deliveryMethod === 'PICKUP_COUNTER'}>
              {order.deliveryMethod === 'SEAT_DELIVERY'
                ? '📦 Entrega no Assento'
                : '🏪 Retirada no Balcão'}
            </DeliveryText>
          </DeliveryBadge>
        </OrderItem>

        {order.seatNumber && (
          <OrderItem>
            <ItemLabel>Assento</ItemLabel>
            <ItemValue>#{order.seatNumber}</ItemValue>
          </OrderItem>
        )}

        <OrderTimer createdAt={order.createdAt} />

        <ButtonContainer>
          {order.snackStatus === 'PENDING' && (
            <>
              <ActionButton
                color="#ffc107"
                onPress={() => handleStatusChange(order.id, 'PREPARING')}
              >
                <Ionicons name="flame" size={16} color="white" />
                <ActionButtonText>Preparando</ActionButtonText>
              </ActionButton>
              <CancelButton onPress={() => handleCancel(order)}>
                <Ionicons name="close" size={18} color="#f44336" />
              </CancelButton>
            </>
          )}

          {order.snackStatus === 'PREPARING' && (
            <>
              <ActionButton
                color="#4CAF50"
                onPress={() => handleStatusChange(order.id, 'READY')}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <ActionButtonText>Pronto</ActionButtonText>
              </ActionButton>
              <CancelButton onPress={() => handleCancel(order)}>
                <Ionicons name="close" size={18} color="#f44336" />
              </CancelButton>
            </>
          )}

          {order.snackStatus === 'READY' && (
            <ActionButton
              color="#2196F3"
              onPress={() => handleStatusChange(order.id, 'DELIVERED')}
            >
              <Ionicons name="arrow-forward" size={16} color="white" />
              <ActionButtonText>Entregue</ActionButtonText>
            </ActionButton>
          )}
        </ButtonContainer>
      </OrderBody>
    </OrderCard>
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>🍳 Fila de Pedidos</HeaderTitle>
        <HeaderSubtitle>
          {activeOrders?.length || 0} pedidos ativos
        </HeaderSubtitle>
      </Header>

      <Content
        data={activeOrders || []}
        renderItem={renderOrderCard}
        keyExtractor={order => order.id}
        ListEmptyComponent={<EmptyText>Nenhum pedido ativo no momento!</EmptyText>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </Container>
  );
}
