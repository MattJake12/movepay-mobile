/**
 * 📊 useRestaurantStats
 * 
 * Hook para dashboard e relatórios do restaurante
 * - Dashboard com KPIs
 * - Relatório de vendas (diário, semanal, mensal)
 * - Estatísticas de produtos
 * - Gráficos e análises
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useRestaurantStats = () => {
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily'); // daily, weekly, monthly
  const queryClient = useQueryClient();

  const api = axios.create({
    baseURL: `${API_URL}/api/restaurant`,
    headers: {
      Authorization: `Bearer ${global.authToken || ''}`
    }
  });

  // =====================================================
  // 📈 DASHBOARD
  // =====================================================
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['restaurant-dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard');
        return response.data.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Erro ao buscar dashboard';
        setError(message);
        console.error('❌ Erro:', message);
        throw err;
      }
    },
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60 // Atualizar a cada 1 minuto
  });

  // =====================================================
  // 💰 RELATÓRIO DE VENDAS
  // =====================================================
  const {
    data: salesReport,
    isLoading: salesLoading,
    refetch: refetchSalesReport
  } = useQuery({
    queryKey: ['sales-report', selectedPeriod],
    queryFn: async () => {
      try {
        const response = await api.get('/sales-report', {
          params: { period: selectedPeriod }
        });
        return response.data.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Erro ao buscar relatório';
        setError(message);
        console.error('❌ Erro:', message);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  // =====================================================
  // 📦 ESTATÍSTICAS DE PRODUTO
  // =====================================================
  const getProductStats = useCallback(
    async (productId) => {
      try {
        const response = await api.get(`/products/${productId}/stats`);
        setError(null);
        return response.data.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Erro ao buscar stats do produto';
        setError(message);
        console.error('❌ Erro:', message);
        return null;
      }
    },
    [api]
  );

  // =====================================================
  // 📊 CALCULAR INSIGHTS
  // =====================================================
  const getInsights = useCallback(() => {
    if (!dashboard || !salesReport) return null;

    const insights = {
      // KPIs Principais
      activeOrdersCount: dashboard.activeOrders || 0,
      ordersTodayCount: dashboard.ordersToday || 0,
      totalRevenue: dashboard.revenueToday || 0,
      topProduct: dashboard.topProduct,

      // Performance
      ordersPerHour: dashboard.ordersToday
        ? Math.round((dashboard.ordersToday / 8) * 10) / 10 // Assumindo 8h operação
        : 0,

      // Produtos
      bestSellingProducts: salesReport?.topProducts || [],
      totalProductsSold: salesReport?.totalOrders || 0,
      averageOrderValue: salesReport?.averageOrderValue || 0,

      // Status
      restaurantStatus: dashboard.status === 'Aberto' ? 'open' : 'closed',

      // Alertas
      hasAlerts: {
        lowStock: false, // A implementar quando tiver model de estoque
        delayedOrders: (dashboard.activeOrders || 0) > 10,
        longWaitTime: false // A implementar com cálculo de tempo de preparo
      }
    };

    return insights;
  }, [dashboard, salesReport]);

  // =====================================================
  // 📈 DADOS PARA GRÁFICOS
  // =====================================================
  const getChartData = useCallback(() => {
    if (!salesReport) return null;

    return {
      topProductsChart: {
        labels: salesReport.topProducts?.map(p => p.name) || [],
        datasets: [
          {
            label: 'Quantidade Vendida',
            data: salesReport.topProducts?.map(p => p.quantity) || [],
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF'
            ]
          }
        ]
      },

      revenueChart: {
        labels: [
          'Receita Total',
          'Média por Pedido'
        ],
        datasets: [
          {
            label: 'AOA',
            data: [
              salesReport.totalRevenue || 0,
              salesReport.averageOrderValue || 0
            ],
            backgroundColor: ['#4CAF50', '#2196F3']
          }
        ]
      }
    };
  }, [salesReport]);

  // =====================================================
  // 🔄 TROCAR PERÍODO
  // =====================================================
  const changePeriod = useCallback((period) => {
    if (['daily', 'weekly', 'monthly'].includes(period)) {
      setSelectedPeriod(period);
    }
  }, []);

  // =====================================================
  // 🔄 REFRESH MANUAL
  // =====================================================
  const refreshAll = useCallback(() => {
    refetchDashboard();
    refetchSalesReport();
    queryClient.invalidateQueries({ queryKey: ['restaurant-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['sales-report'] });
  }, [refetchDashboard, refetchSalesReport, queryClient]);

  // =====================================================
  // 📊 FORMATADORES
  // =====================================================
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-AO').format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-AO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return {
    // Dashboard
    dashboard,
    dashboardLoading,

    // Vendas
    salesReport,
    salesLoading,
    selectedPeriod,
    changePeriod,

    // Métodos
    getProductStats,
    getInsights,
    getChartData,
    refreshAll,

    // Formatadores
    formatCurrency,
    formatNumber,
    formatDate,

    // Status
    error,
    isLoading: dashboardLoading || salesLoading
  };
};

export default useRestaurantStats;
