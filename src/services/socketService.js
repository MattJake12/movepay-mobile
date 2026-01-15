import io from 'socket.io-client';
import { useUserStore } from '../store/useUserStore';
import { useToastStore } from './toastService';
import { queryClient } from './queryClient';
import api from './api';
import Constants from 'expo-constants';

// URL do Backend (usando variável de ambiente ou fallback)
const SOCKET_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.10:3000'; 

let socket = null;

export const socketService = {
  connect: () => {
    const user = useUserStore.getState().user;
    const token = useUserStore.getState().token;

    if (!user || !token || socket?.connected) return;

    console.log('🔌 Conectando ao Socket.io:', SOCKET_URL);

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('✅ Socket Mobile Conectado:', socket.id);
      
      // Entrar na sala do usuário para receber notificações pessoais
      const currentUser = useUserStore.getState().user;
      if (currentUser?.id) {
        socket.emit('join_user_room', currentUser.id);
        console.log('👤 Joining user room:', currentUser.id);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket Mobile Desconectado:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Erro Conexão Socket:', err.message);
    });

    // ===== WALLET EVENTS =====
    socket.on('wallet:balance_update', (data) => {
      console.log('💰 Saldo Atualizado:', data);
      queryClient.invalidateQueries(['wallet']);
      queryClient.invalidateQueries(['wallet-history']);

      if (data.message) {
        useToastStore.getState().showToast(data.message, 'success');
      }
    });

    socket.on('wallet:transfer_received', (data) => {
      console.log('💸 Dinheiro recebido:', data);
      if (data.message) {
        useToastStore.getState().showToast(data.message, 'success');
      }
      queryClient.invalidateQueries(['wallet']);
    });

    // ===== LISTENERS DE EVENTOS DE RESTAURANTE =====
    
    socket.on('snack-preparing', (data) => {
      console.log('👨‍🍳 Pedido Preparando:', data);
      useToastStore.getState().showToast(
        `Seu pedido ${data.snackName || ''} está sendo preparado!`, 
        'info'
      );
    });

    socket.on('snack-ready', (data) => {
      console.log('🍔 Pedido Pronto:', data);
      useToastStore.getState().showToast(
        `Seu pedido ${data.snackName || ''} está PRONTO para retirar!`, 
        'success'
      );
    });

    socket.on('snack-delivered', (data) => {
      console.log('✅ Pedido Entregue:', data);
      useToastStore.getState().showToast(
        `Bom apetite! Pedido ${data.snackName || ''} entregue.`, 
        'success'
      );
    });

    socket.on('snack-cancelled', (data) => {
      console.log('🚫 Pedido Cancelado:', data);
      useToastStore.getState().showToast(
        `O pedido ${data.snackName || ''} foi cancelado.`, 
        'error'
      );
    });
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
};
