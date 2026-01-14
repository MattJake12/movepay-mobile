/**
 * 🍳 useRestaurantManagement
 * 
 * Hook para gerenciar cardápio (CRUD produtos)
 * - Listar produtos
 * - Criar novo produto
 * - Editar produto
 * - Deletar produto
 * - Gerenciar categorias
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useRestaurantManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const api = axios.create({
    baseURL: `${API_URL}/api/restaurant`,
    headers: {
      Authorization: `Bearer ${global.authToken || ''}`
    }
  });

  // =====================================================
  // 📋 LISTAR CARDÁPIO
  // =====================================================
  const {
    data: menu = [],
    isLoading: menuLoading,
    refetch: refetchMenu
  } = useQuery({
    queryKey: ['restaurant-menu'],
    queryFn: async () => {
      try {
        const response = await api.get('/menu');
        return response.data.data || [];
      } catch (err) {
        console.error('❌ Erro ao listar menu:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  // =====================================================
  // ➕ CRIAR PRODUTO
  // =====================================================
  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await api.post('/menu', productData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setError(null);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Erro ao criar produto';
      setError(message);
      console.error('❌ Erro:', message);
    }
  });

  const createProduct = useCallback(
    async (name, description, price, imageUrl, category) => {
      setIsLoading(true);
      try {
        await createProductMutation.mutateAsync({
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          category,
          isActive: true
        });
        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [createProductMutation]
  );

  // =====================================================
  // ✏️ EDITAR PRODUTO
  // =====================================================
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, ...updateData }) => {
      const response = await api.put(`/menu/${productId}`, updateData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setError(null);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Erro ao atualizar produto';
      setError(message);
      console.error('❌ Erro:', message);
    }
  });

  const updateProduct = useCallback(
    async (productId, name, description, price, imageUrl, category, isActive) => {
      setIsLoading(true);
      try {
        await updateProductMutation.mutateAsync({
          productId,
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          category,
          isActive
        });
        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [updateProductMutation]
  );

  // =====================================================
  // 🗑️ DELETAR PRODUTO
  // =====================================================
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      await api.delete(`/menu/${productId}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setError(null);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Erro ao deletar produto';
      setError(message);
      console.error('❌ Erro:', message);
    }
  });

  const deleteProduct = useCallback(
    async (productId) => {
      setIsLoading(true);
      try {
        await deleteProductMutation.mutateAsync(productId);
        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [deleteProductMutation]
  );

  // =====================================================
  // 🔄 TOGGLE ATIVO/INATIVO
  // =====================================================
  const toggleProductStatus = useCallback(
    async (productId, currentStatus) => {
      const product = menu.find(p => p.id === productId);
      if (!product) return { success: false, error: 'Produto não encontrado' };

      return updateProduct(
        productId,
        product.name,
        product.description,
        product.price,
        product.imageUrl,
        product.category,
        !currentStatus
      );
    },
    [menu, updateProduct]
  );

  // =====================================================
  // 📊 OBTER INFO DO RESTAURANTE
  // =====================================================
  const {
    data: restaurantInfo,
    isLoading: restaurantLoading
  } = useQuery({
    queryKey: ['restaurant-info'],
    queryFn: async () => {
      try {
        const response = await api.get('/info');
        return response.data.data;
      } catch (err) {
        console.error('❌ Erro ao buscar info:', err);
        throw err;
      }
    }
  });

  return {
    // Menu
    menu,
    menuLoading: menuLoading || isLoading,
    refetchMenu,
    
    // Restaurant Info
    restaurantInfo,
    restaurantLoading,

    // CRUD Operations
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,

    // Status
    error,
    isLoading
  };
};

export default useRestaurantManagement;
