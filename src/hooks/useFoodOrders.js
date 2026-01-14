import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from './useAuth';
import { io } from 'socket.io-client';
import { useToast } from './useToast';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'https://movepay-api.onrender.com';

/**
 * Hook para gerenciar pedidos de comida com atualizações em tempo real
 * - Busca lista de pedidos via REST
 * - Conecta ao Socket para receber atualizações de status instantaneamente
 * - Separa pedidos ativos (PENDING, PREPARING, READY) de histórico (DELIVERED, CANCELLED)
 */
export function useFoodOrders() {
  const queryClient = useQueryClient();
  const { user, token } = useAuth();
  const { showSuccess, showInfo, showError } = useToast();
  const [activeSocket, setActiveSocket] = useState(null);

  // 1. Buscar Pedidos de Comida (REST - Query com Polling)
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-food-orders'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/food-orders');
      return data.data || [];
    },
    refetchInterval: 30000, // Polling a cada 30s como backup
    enabled: !!user?.id, // Só executa se user existir
    staleTime: 10000 // Dados válidos por 10s
  });

  // 2. Conectar ao Socket.io para Realtime Updates
  useEffect(() => {
    if (!user?.id || !token) return;

    // Conectar ao namespace do restaurante/delivery
    const socket = io(`${SOCKET_URL}/restaurant`, {
      auth: { 
        token: token || 'placeholder-token',
        userId: user.id
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socket.on('connect', () => {
      console.log('✅ Socket conectado para atualizações de pedidos');
      // Entrar na sala específica do cliente
      socket.emit('join-customer-room', { userId: user.id });
    });

    // ===============================================
    // EVENTO: Lanche começou a ser preparado
    // ===============================================
    socket.on('snack-preparing', (data) => {
      console.log('🍳 Lanche em preparação:', data);
      showInfo(data.message || `O preparo de ${data.snackName} começou!`);
      
      queryClient.setQueryData(['my-food-orders'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(order => 
          order.orderId === data.ticketId 
            ? { ...order, status: 'PREPARING' } 
            : order
        );
      });
    });

    // ===============================================
    // EVENTO: Lanche ficou pronto
    // ===============================================
    socket.on('snack-ready', (data) => {
      console.log('✅ Lanche pronto!:', data);
      showSuccess(data.message || `Seu ${data.snackName} está pronto!`);
      
      queryClient.setQueryData(['my-food-orders'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(order => 
          order.orderId === data.ticketId 
            ? { 
                ...order, 
                status: 'READY',
                readyAt: new Date().toISOString()
              } 
            : order
        );
      });
    });

    // ===============================================
    // EVENTO: Lanche foi entregue
    // ===============================================
    socket.on('snack-delivered', (data) => {
      console.log('🎉 Lanche entregue:', data);
      showSuccess(data.message || `${data.snackName} entregue. Bom apetite!`);
      
      queryClient.setQueryData(['my-food-orders'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(order => 
          order.orderId === data.ticketId 
            ? { 
                ...order, 
                status: 'DELIVERED',
                deliveredAt: new Date().toISOString()
              } 
            : order
        );
      });
    });

    // ===============================================
    // EVENTO: Pedido foi cancelado
    // ===============================================
    socket.on('snack-cancelled', (data) => {
      console.log('❌ Pedido cancelado:', data);
      showError(data.message || `Pedido de ${data.snackName} cancelado.`);
      
      queryClient.setQueryData(['my-food-orders'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(order => 
          order.orderId === data.ticketId 
            ? { 
                ...order, 
                status: 'CANCELLED',
                cancelReason: data.reason
              } 
            : order
        );
      });
    });

    // Tratamento de desconexão
    socket.on('disconnect', () => {
      console.log('⚠️  Socket desconectado');
    });

    socket.on('error', (error) => {
      console.error('❌ Erro no socket:', error);
    });

    setActiveSocket(socket);

    // Cleanup na desmontagem
    return () => {
      socket.disconnect();
    };
  }, [user?.id, token, queryClient]);

  // 3. Separar Pedidos em Ativos vs Histórico
  const activeOrders = orders.filter(o => 
    ['PENDING', 'PREPARING', 'READY'].includes(o.status)
  );

  const pastOrders = orders.filter(o => 
    ['DELIVERED', 'CANCELLED'].includes(o.status)
  );

  return {
    // Dados
    orders,
    activeOrders,
    pastOrders,
    
    // Estados
    isLoading,
    error,
    
    // Ações
    refetch,
    
    // Socket info
    isSocketConnected: activeSocket?.connected || false
  };
}

/**
 * Hook para rastrear um pedido específico
 * Útil se quiser uma tela dedicada para um único pedido
 */
export function useFoodOrderById(orderId) {
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['food-order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${orderId}`);
      return data.data;
    },
    enabled: !!orderId,
    staleTime: 10000
  });

  return { order, isLoading, error, refetch };
}
