import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { MOCK_WALLET } from '../services/mockWallet';

/**
 * 💰 HOOK: useWallet
 * Gerencia toda a lógica da carteira (saldo, transações, etc)
 */
export function useWallet() {
  const queryClient = useQueryClient();

  // ============================================
  // 1. BUSCAR DADOS DA CARTEIRA (Resumo)
  // ============================================
  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get('/wallet');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // ============================================
  // 2. BUSCAR HISTÓRICO DETALHADO (Com Filtros)
  // ============================================
  const useHistory = (filter = 'ALL', page = 1) =>
    useQuery({
      queryKey: ['wallet-history', filter, page],
      queryFn: async () => {
        const { data } = await api.get(
          `/wallet/history?filter=${filter}&page=${page}`
        );
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });

  // ============================================
  // 3. TOP-UP (Carregar Carteira)
  // ============================================
  const topUpMutation = useMutation({
    mutationFn: async ({ amount, method, phone }) => {
      const { data } = await api.post('/wallet/top-up', {
        amount: parseInt(amount),
        method,
        phone,
      });
      return data;
    },
    onSuccess: () => {
      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-history'] });
    },
  });

  // ============================================
  // 4. TRANSFERÊNCIA P2P
  // ============================================
  const transferMutation = useMutation({
    mutationFn: async ({ phone, email, identifier, amount }) => {
      const { data } = await api.post('/wallet/transfer', {
        phone,
        email,
        identifier,
        amount: parseInt(amount),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-history'] });
    },
  });

  return {
    // Dados
    wallet: walletQuery.data,
    isLoadingWallet: walletQuery.isLoading,
    walletError: walletQuery.error,

    // Métodos
    refetchWallet: walletQuery.refetch,
    useHistory,
    topUp: topUpMutation,
    transfer: transferMutation,
  };
}
