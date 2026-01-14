// mobile/src/hooks/useSocket.js

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://movepay-api.onrender.com';

/**
 * Hook para gerenciar conexão Socket.io centralizada no Mobile
 * @param {string} namespace - Ex: '/chat', '/gps', '/restaurant'
 */
export function useSocket(namespace = '') {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userStr = await AsyncStorage.getItem('userData');
        const user = userStr ? JSON.parse(userStr) : null;

        const baseUrl = SOCKET_URL;
        const fullUrl = namespace 
          ? (baseUrl.endsWith('/') ? `${baseUrl}${namespace.substring(1)}` : `${baseUrl}${namespace}`)
          : baseUrl;

        const newSocket = io(fullUrl, {
          auth: {
            token,
            userId: user?.id,
            userName: user?.name,
            userRole: user?.role
          },
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000
        });

        newSocket.on('connect', () => {
          console.log(`✅ Socket conectado (${namespace || 'root'}):`, newSocket.id);
          if (isMounted) setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log(`🔌 Socket desconectado (${namespace || 'root'})`);
          if (isMounted) setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
          console.error(`❌ Erro de conexão Socket (${namespace || 'root'}):`, err.message);
        });

        socketRef.current = newSocket;
        if (isMounted) setSocket(newSocket);
      } catch (error) {
        console.error('❌ Erro no setup do socket:', error);
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [namespace]);

  return {
    socket,
    isConnected
  };
}
