// File: src/hooks/useOfflineMutation.js

import { useMutation } from '@tanstack/react-query';
import { useNetworkStatus } from './useNetworkStatus';
import { useOfflineQueue } from './useOfflineQueue';

/**
 * Hook que estende useMutation para suportar offline
 * Automaticamente enfileira requisições quando offline
 */
export function useOfflineMutation(mutationFn, options = {}) {
  const { isOnline } = useNetworkStatus();
  const { enqueueRequest } = useOfflineQueue();

  return useMutation({
    ...options,
    mutationFn: async (data) => {
      // Se online, executar normalmente
      if (isOnline) {
        return mutationFn(data);
      }

      // Se offline, retornar dados otimistas e enfileirar
      console.log('[OfflineMutation] Offline - enfileirando:', data);

      // Extrair informações da mutação
      const requestInfo = extractRequestInfo(data, options);

      // Enfileirar
      await enqueueRequest(requestInfo);

      // Retornar os dados como se tivessem sido salvos
      return { success: true, data, queued: true };
    },
    onError: (error) => {
      // Se for erro de rede enquanto online, pode ser intermitente
      if (error?.code === 'NETWORK_ERROR' || error?.code === 'ERR_NETWORK') {
        console.log('[OfflineMutation] Erro de rede, tentando enfileirar...');
      }
      options.onError?.(error);
    },
  });
}

/**
 * Extrai informações da requisição para armazenar offline
 */
function extractRequestInfo(data, options) {
  // Se já tem url/method definidos
  if (options.method && options.url) {
    return {
      method: options.method,
      url: options.url,
      data,
    };
  }

  // Tentar inferir a partir do padrão de dados
  console.warn('[extractRequestInfo] Não foi possível extrair automaticamente - passe method e url nas options');

  return {
    method: 'POST',
    url: '/api/unknown',
    data,
  };
}
