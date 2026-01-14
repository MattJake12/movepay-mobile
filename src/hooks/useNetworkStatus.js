// File: src/hooks/useNetworkStatus.js

import { useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Subscribe ao estado da rede
    unsubscribeRef.current = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      setNetworkType(state.type);

      console.log('[NetworkStatus]', {
        online,
        type: state.type,
        connected: state.isConnected,
        reachable: state.isInternetReachable,
      });
    });

    // Verificar estado inicial
    NetInfo.fetch().then((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      setNetworkType(state.type);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return { isOnline, networkType };
}
