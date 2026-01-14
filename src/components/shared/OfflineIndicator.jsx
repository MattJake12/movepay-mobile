// File: src/components/shared/OfflineIndicator.jsx

import React from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Wifi, WifiOff, Cloud } from 'lucide-react-native';

export function OfflineIndicator() {
  const { isOnline, networkType } = useNetworkStatus();
  const { queueSize, isSyncing } = useOfflineQueue();

  if (isOnline && queueSize === 0) {
    return null; // Não mostrar quando tudo está ok
  }

  const isOffline = !isOnline;
  const hasPendingSync = queueSize > 0;

  return (
    <View
      className={`px-4 py-2 ${
        isOffline
          ? 'bg-red-50 border-b border-red-200'
          : hasPendingSync
          ? 'bg-amber-50 border-b border-amber-200'
          : 'bg-green-50 border-b border-green-200'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          {isOffline ? (
            <>
              <WifiOff size={16} color="#dc2626" />
              <Text className="text-xs font-medium text-red-700">
                Sem conexão
              </Text>
            </>
          ) : hasPendingSync ? (
            <>
              <Cloud
                size={16}
                color={isSyncing ? '#f59e0b' : '#10b981'}
                className={isSyncing ? 'animate-bounce' : ''}
              />
              <Text className="text-xs font-medium text-amber-700">
                {isSyncing
                  ? 'Sincronizando...'
                  : `${queueSize} pendente${queueSize > 1 ? 's' : ''}`}
              </Text>
            </>
          ) : (
            <>
              <Wifi size={16} color="#10b981" />
              <Text className="text-xs font-medium text-green-700">
                Online • {networkType}
              </Text>
            </>
          )}
        </View>

        {hasPendingSync && !isSyncing && (
          <View className="bg-amber-100 px-2 py-1 rounded">
            <Text className="text-[10px] font-semibold text-amber-800">
              PENDENTE
            </Text>
          </View>
        )}
      </View>

      {/* Dica */}
      {isOffline && (
        <Text className="text-[10px] text-red-600 mt-1">
          As suas ações serão sincronizadas quando a conexão voltar
        </Text>
      )}
    </View>
  );
}
