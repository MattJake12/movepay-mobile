// File: src/services/toastService.js

import { Alert } from 'react-native';
import { create } from 'zustand';

/**
 * 🔔 Toast Notification Service para Expo Go
 * 
 * Sistema simples de notificações locais tipo toast
 * Funciona perfeitamente em Expo Go (sem dependências externas)
 */

// Store para gerenciar toasts ativos
export const useToastStore = create((set) => ({
  toasts: [],
  
  showToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date(),
    };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
    
    // Remove automaticamente após duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
    
    return id;
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  
  clearAll: () => set({ toasts: [] }),
}));

/**
 * Helper functions para diferentes tipos de notificações
 */
export const Toast = {
  success: (message, duration = 3000) => {
    useToastStore.getState().showToast(message, 'success', duration);
  },
  
  error: (message, duration = 3000) => {
    useToastStore.getState().showToast(message, 'error', duration);
  },
  
  warning: (message, duration = 3000) => {
    useToastStore.getState().showToast(message, 'warning', duration);
  },
  
  info: (message, duration = 3000) => {
    useToastStore.getState().showToast(message, 'info', duration);
  },
  
  /**
   * Alert do React Native (mais intrusivo, mas compatível)
   */
  alert: (title, message, onPress = null) => {
    Alert.alert(title, message, [
      {
        text: 'OK',
        onPress: onPress,
      },
    ]);
  },
};

export default Toast;
