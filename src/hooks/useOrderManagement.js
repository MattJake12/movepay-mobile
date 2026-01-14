/**
 * 🛎️ useOrderManagement
 * 
 * Hook para gerenciar pedidos de lanches
 * - Listar pedidos ativos (KDS - Kitchen Display System)
 * - Atualizar status do pedido (PENDING → PREPARING → READY → DELIVERED)
 * - Cancelar pedido
 * - Histórico de pedidos
 * - Monitorar pedidos via Socket.io
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export const useOrderManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  const api = axios.create({
    baseURL: `${API_URL}/api/restaurant`,
    headers: {
      Authorization: `Bearer ${global.authToken || ''}`
    }
  });

  // =====================================================
  // 🔌 INICIALIZAR SOCKET.IO
  // =====================================================
  useEffect(() => {
    if (!global.authToken) {
      console.warn('⚠️ Token não disponível, não conectando Socket.io');
      return;
    }

    console.log('🔌 Conectando ao Socket.io /restaurant...');

    const newSocket = io(`${SOCKET_URL}/restaurant`, {
      auth: {
        token: global.authToken
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Conexão sucesso
    newSocket.on('connect', () => {
      console.log('✅ Socket.io conectado:', newSocket.id);
      setSocketConnected(true);

      // Emitir login do gerente
      newSocket.emit('manager-login', {
        timestamp: new Date().toISOString()
      });
    });

    // Receber sucesso de conexão
    newSocket.on('connection-success', (data) => {
      console.log('📱 Manager login sucesso:', data);
    });

    // Novo pedido recebido
    newSocket.on('order-received', (data) => {
      console.log('🆕 Novo pedido:', data);
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    });

    // Status do pedido atualizado
    newSocket.on('order-status-updated', (data) => {
      console.log('📊 Status atualizado:', data);
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    });

    // Pedido cancelado
    newSocket.on('order-was-cancelled', (data) => {
      console.log('❌ Pedido cancelado:', data);
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    });

    // Erro
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      setError(error.message || 'Erro de conexão');
    });

    // Desconecção
    newSocket.on('disconnect', () => {
      console.log('🔴 Socket desconectado');
      setSocketConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [global.authToken, queryClient]);

  // =====================================================
  // 📋 LISTAR PEDIDOS ATIVOS (KDS)
  // =====================================================
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['active-orders'],
    queryFn: async () => {
      try {
        const response = await api.get('/kds');
        const data = response.data.data || [];

        // Ordenar por tempo esperado (mais antigos primeiro)
        return data.sort((a, b) => {
          return a.timeWaitingMs - b.timeWaitingMs;
        });
      } catch (err) {
        console.error('❌ Erro ao listar pedidos ativos:', err);
        throw err;
      }
    },
    staleTime: 1000 * 10, // 10 segundos
    refetchInterval: 1000 * 15 // Atualizar a cada 15 segundos
  });

  useEffect(() => {
    setActiveOrders(orders);
  }, [orders]);

  // =====================================================
  // 📊 ATUALIZAR STATUS DO PEDIDO
  // =====================================================
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }) => {
      const response = await api.patch(`/orders/${ticketId}/status`, { status });
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('✅ Status atualizado:', data);
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      
      // Emitir evento via Socket.io
      if (socketRef.current) {
        socketRef.current.emit('order-status-changed', {
          ticketId: data.id,
          status: data.snackStatus,
          snackName: data.snack?.name
        });
      }

      setError(null);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Erro ao atualizar status';
      setError(message);
      console.error('❌ Erro:', message);
    }
  });

  const updateOrderStatus = useCallback(
    async (ticketId, status) => {
      setIsLoading(true);
      try {
        await updateOrderStatusMutation.mutateAsync({ ticketId, status });
        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [updateOrderStatusMutation]
  );

  // Status convenientes
  const moveToPreparation = (ticketId) => updateOrderStatus(ticketId, 'PREPARING');
  const moveToReady = (ticketId) => updateOrderStatus(ticketId, 'READY');
  const moveToDelivered = (ticketId) => updateOrderStatus(ticketId, 'DELIVERED');

  // =====================================================
  // ❌ CANCELAR PEDIDO
  // =====================================================
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ ticketId, reason }) => {
      const response = await api.patch(`/orders/${ticketId}/cancel`, { reason });
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('✅ Pedido cancelado:', data);
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });

      // Emitir evento via Socket.io
      if (socketRef.current) {
        socketRef.current.emit('order-cancelled', {
          ticketId: data.id,
          reason: 'Cancelado pelo restaurante'
        });
      }

      setError(null);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Erro ao cancelar pedido';
      setError(message);
      console.error('❌ Erro:', message);
    }
  });

  const cancelOrder = useCallback(
    async (ticketId, reason = 'Cancelado pelo restaurante') => {
      setIsLoading(true);
      try {
        await cancelOrderMutation.mutateAsync({ ticketId, reason });
        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [cancelOrderMutation]
  );

  // =====================================================
  // 📊 HISTÓRICO DE PEDIDOS
  // =====================================================
  const {
    data: orderHistory = [],
    isLoading: historyLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useQuery({
    queryKey: ['order-history'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response = await api.get('/orders/history', {
          params: {
            status: 'DELIVERED',
            limit: 20,
            offset: pageParam
          }
        });
        return response.data;
      } catch (err) {
        console.error('❌ Erro ao buscar histórico:', err);
        throw err;
      }
    }
  });

  // =====================================================
  // 📈 ESTATÍSTICAS
  // =====================================================
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['restaurant-stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/stats');
        return response.data.data;
      } catch (err) {
        console.error('❌ Erro ao buscar stats:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 // 1 minuto
  });

  return {
    // Estado
    activeOrders,
    ordersLoading: ordersLoading || isLoading,
    orderHistory: orderHistory.data || [],
    historyLoading,
    stats,
    statsLoading,

    // Socket
    socketConnected,

    // Métodos
    updateOrderStatus,
    moveToPreparation,
    moveToReady,
    moveToDelivered,
    cancelOrder,
    refetchOrders,

    // Paginação
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,

    // Status
    error,
    isLoading
  };
};

export default useOrderManagement;
