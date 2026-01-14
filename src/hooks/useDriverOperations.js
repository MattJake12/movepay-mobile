import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useToastStore } from '../services/toastService';

/**
 * Hook para operações do motorista/operador
 * - Manifesto de passageiros
 * - Check-in manual (toggle VALID <-> USED)
 */
export function useDriverOperations(tripId) {
  const queryClient = useQueryClient();

  /**
   * Buscar Manifesto (lista de passageiros confirmados)
   */
  const { 
    data: manifest, 
    isLoading, 
    error: manifestError,
    refetch 
  } = useQuery({
    queryKey: ['trip-manifest', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/operator/trips/${tripId}/manifest`);
      return data.data; // { trip: {...}, passengers: [...] }
    },
    enabled: !!tripId,
    staleTime: 0, // Sempre buscar dados frescos
    refetchInterval: 10000 // Atualizar a cada 10s para ver novos check-ins em tempo real
  });

  /**
   * Mutation para Check-in Manual (toggle)
   * Transforma VALID -> USED ou USED -> VALID
   */
  const checkInMutation = useMutation({
    mutationFn: async (ticketId) => {
      return api.post('/operator/check-in', { ticketId });
    },
    onSuccess: (response) => {
      const { data: updatedTicket, message } = response.data;
      const status = updatedTicket.status;

      // Otimista: atualizar cache local instantaneamente
      queryClient.setQueryData(['trip-manifest', tripId], (old) => {
        if (!old || !old.passengers) return old;
        
        return {
          ...old,
          passengers: old.passengers.map(p => 
            (p.ticketId === updatedTicket.id || p.id === updatedTicket.id)
              ? { 
                  ...p, 
                  status: status,
                  name: updatedTicket.user?.name || p.name,
                  phone: updatedTicket.user?.phone || p.phone
                } 
              : p
          )
        };
      });

      // Invalidar query para garantir sincronização no próximo ciclo
      setTimeout(() => {
        queryClient.invalidateQueries(['trip-manifest', tripId]);
      }, 2000);

      const action = status === 'USED' ? 'realizado' : 'cancelado';
      useToastStore.getState().showToast(`Check-in ${action} com sucesso!`, 'success');

      return { status, message };
    },
    onError: (error) => {
      console.error('Erro no check-in:', error);
      useToastStore.getState().showToast('Erro ao atualizar check-in.', 'error');
    }
  });

  return {
    manifest,
    isLoading,
    error: manifestError,
    refetch,
    toggleCheckIn: checkInMutation.mutate,
    isCheckingIn: checkInMutation.isPending,
    checkInError: checkInMutation.error
  };
}

/**
 * Hook para rastreamento de encomendas
 */
export function useParcelTracking(trackingCode) {
  const { 
    data: parcel, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['parcel-tracking', trackingCode],
    queryFn: async () => {
      const { data } = await api.get(`/cargo/track/${trackingCode?.toUpperCase()}`);
      return data.data;
    },
    enabled: !!trackingCode,
    staleTime: 30000, // Cache de 30s
    refetchInterval: 30000 // Atualizar a cada 30s
  });

  return {
    parcel,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook para criar nova encomenda
 */
export function useCreateParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parcelData) => {
      return api.post('/cargo', parcelData);
    },
    onSuccess: (response) => {
      // Invalidar lista de encomendas
      queryClient.invalidateQueries(['cargo-list']);
      return response.data;
    }
  });
}
