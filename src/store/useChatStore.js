// File: src/store/useChatStore.js

/**
 * 🎯 useChatStore - Zustand Store para Chat Mobile
 * 
 * Gerencia estado local do chat:
 * - Sessões ativas
 * - Mensagens não-lidas
 * - Status de digitação
 * - Conexão Socket.io
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useChatStore = create(
  persist(
    (set, get) => ({
      // 🎯 Estado
      sessions: {}, // { sessionId: { messages, unread, lastMessageAt } }
      activeSessions: [], // [sessionId, ...]
      unreadCount: 0,
      lastCheckedTime: null,

      // 💬 Ações

      /**
       * Abrir sessão
       */
      openSession: (sessionId) => {
        set((state) => {
          const activeSessions = [...state.activeSessions];
          if (!activeSessions.includes(sessionId)) {
            activeSessions.push(sessionId);
          }

          return {
            activeSessions,
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...state.sessions[sessionId],
                unread: 0
              }
            }
          };
        });
      },

      /**
       * Fechar sessão
       */
      closeSession: (sessionId) => {
        set((state) => ({
          activeSessions: state.activeSessions.filter(id => id !== sessionId)
        }));
      },

      /**
       * Adicionar mensagem
       */
      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              messages: [
                ...(state.sessions[sessionId]?.messages || []),
                message
              ],
              lastMessageAt: new Date().toISOString()
            }
          }
        }));
      },

      /**
       * Marcar como lido
       */
      markSessionRead: (sessionId) => {
        set((state) => {
          const newUnreadCount = Math.max(
            0,
            state.unreadCount - (state.sessions[sessionId]?.unread || 0)
          );

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...state.sessions[sessionId],
                unread: 0
              }
            },
            unreadCount: newUnreadCount,
            lastCheckedTime: new Date().toISOString()
          };
        });
      },

      /**
       * Incrementar não-lido
       */
      incrementUnread: (sessionId) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              unread: (state.sessions[sessionId]?.unread || 0) + 1
            }
          },
          unreadCount: state.unreadCount + 1
        }));
      },

      /**
       * Limpar todas as sessões
       */
      clearSessions: () => {
        set({
          sessions: {},
          activeSessions: [],
          unreadCount: 0
        });
      }
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        unreadCount: state.unreadCount,
        lastCheckedTime: state.lastCheckedTime
      })
    }
  )
);

export default useChatStore;
