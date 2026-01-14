// File: src/store/useUserStore.js

import { create } from 'zustand';
import { storage } from '../services/storage';

export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Chamado no login ou splash screen
  hydrate: async () => {
    console.log('💧 [Store] Hydrating user...');
    try {
      const user = await storage.getUser();
      const token = await storage.getToken();
      
      console.log('💧 [Store] Got from storage - User:', user ? 'FOUND' : 'NULL', 'Token:', token ? 'FOUND' : 'NULL');
      
      if (user && token) {
        // Validação de Integridade
        if (!user.name || !user.id) {
            console.warn('⚠️ [Store] Dados de usuário corrompidos ou incompletos. Forçando logout.');
            await storage.clearAll();
            set({ user: null, isAuthenticated: false });
            return;
        }

        console.log('💧 [Store] Setting authenticated state with user:', user.name);
        set({ user, isAuthenticated: true });
      } else {
        console.log('💧 [Store] Auth failed during hydration');
        set({ user: null, isAuthenticated: false });
      }
    } catch (e) {
      console.error('💧 [Store] Hydration error:', e);
      set({ user: null, isAuthenticated: false });
    }
  },

  login: (user, token) => {
    storage.setUser(user);
    storage.setToken(token);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await storage.clearAll();
    set({ user: null, isAuthenticated: false });
  }
}));