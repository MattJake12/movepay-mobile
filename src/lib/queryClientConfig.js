// File: src/lib/queryClientConfig.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

// Criar persister com AsyncStorage
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  maxAge: 1000 * 60 * 60 * 24, // 24 horas
});

// Criar QueryClient com configurações de offline
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Manter dados em cache por mais tempo em caso de offline
        gcTime: 1000 * 60 * 60 * 24, // 24 horas
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: 3, // Tentar 3 vezes antes de falhar
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
        // Não remover queries ao desmontar componente (offline support)
        gcTime: Infinity,
      },
      mutations: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
};

export const queryClient = createQueryClient();

export { asyncStoragePersister, PersistQueryClientProvider };
