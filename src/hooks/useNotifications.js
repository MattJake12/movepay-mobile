/**
 * 🔔 useNotifications Hook
 * ✅ MISSÃO 4: Gerenciamento de notificações do usuário
 * Usa React Query com polling automático
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useNotifications(options = {}) {
  const queryClient = useQueryClient();
  const {
    page = 1,
    limit = 20,
    pollInterval = 30000, // 30 segundos
    enabled = true
  } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/notifications', {
        params: { page, limit }
      });
      return data; // { success, data, meta: { unreadCount, total, pages } }
    },
    refetchInterval: pollInterval, // Polling automático
    enabled: enabled,
    staleTime: 10000, // Stale após 10 segundos
    cacheTime: 1000 * 60 * 5 // Manter por 5 minutos
  });

  // Mutation: Marcar todas como lidas
  const markReadMutation = useMutation({
    mutationFn: async () => {
      const result = await api.patch('/notifications/read-all');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mutation: Marcar uma específica como lida
  const markOneReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const result = await api.patch(`/notifications/${notificationId}/read`);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return {
    notifications: data?.data || [],
    unreadCount: data?.meta?.unreadCount || 0,
    total: data?.meta?.total || 0,
    page: data?.meta?.page || 1,
    pages: data?.meta?.pages || 1,
    isLoading,
    error,
    refetch,
    markAllAsRead: () => markReadMutation.mutate(),
    markAsRead: (id) => markOneReadMutation.mutate(id),
    isMarkingAsRead: markReadMutation.isPending
  };
}
