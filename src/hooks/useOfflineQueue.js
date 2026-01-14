// File: src/hooks/useOfflineQueue.js

import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from './useNetworkStatus';
import { useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const OFFLINE_QUEUE_KEY = '@movepay_offline_queue';

export function useOfflineQueue() {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const processingRef = useRef(false);

  // Adicionar à fila
  const enqueueRequest = async (request) => {
    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const requests = queue ? JSON.parse(queue) : [];

      requests.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...request,
      });

      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(requests));
      setQueueSize(requests.length);

      console.log('[OfflineQueue] Requisição enfileirada:', request);

      // Tentar processar imediatamente se online
      if (isOnline) {
        await processQueue();
      }
    } catch (error) {
      console.error('[OfflineQueue] Erro ao enfileirar:', error);
    }
  };

  // Processar fila quando voltar online
  const processQueue = async () => {
    if (processingRef.current || !isOnline) return;

    processingRef.current = true;
    setIsSyncing(true);

    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queue) {
        setQueueSize(0);
        setIsSyncing(false);
        return;
      }

      const requests = JSON.parse(queue);
      const successfulIds = [];
      const failedRequests = [];

      for (const request of requests) {
        try {
          console.log('[OfflineQueue] Processando:', request);

          let response;
          switch (request.method?.toUpperCase()) {
            case 'POST':
              response = await api.post(request.url, request.data);
              break;
            case 'PUT':
              response = await api.put(request.url, request.data);
              break;
            case 'PATCH':
              response = await api.patch(request.url, request.data);
              break;
            case 'DELETE':
              response = await api.delete(request.url);
              break;
            default:
              response = await api.get(request.url);
          }

          successfulIds.push(request.id);
          console.log('[OfflineQueue] Sucesso:', request.id);
        } catch (error) {
          failedRequests.push(request);
          console.error('[OfflineQueue] Falha:', request.id, error.message);
        }
      }

      // Remover requisições bem-sucedidas da fila
      const remainingRequests = requests.filter(
        (req) => !successfulIds.includes(req.id)
      );

      if (remainingRequests.length === 0) {
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
        setQueueSize(0);

        // Invalidar queries após sincronização bem-sucedida
        queryClient.invalidateQueries();
      } else {
        await AsyncStorage.setItem(
          OFFLINE_QUEUE_KEY,
          JSON.stringify(remainingRequests)
        );
        setQueueSize(remainingRequests.length);
      }

      console.log('[OfflineQueue] Sincronização completa:', {
        processadas: successfulIds.length,
        falhadas: failedRequests.length,
        pendentes: remainingRequests.length,
      });
    } catch (error) {
      console.error('[OfflineQueue] Erro ao processar fila:', error);
    } finally {
      processingRef.current = false;
      setIsSyncing(false);
    }
  };

  // Monitorar conexão
  useEffect(() => {
    if (isOnline && queueSize > 0) {
      console.log('[OfflineQueue] Voltou online, processando fila...');
      processQueue();
    }
  }, [isOnline]);

  return {
    enqueueRequest,
    processQueue,
    queueSize,
    isSyncing,
    isOnline,
  };
}
