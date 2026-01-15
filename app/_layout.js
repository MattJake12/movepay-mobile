// File: app/_layout.js

import React, { useEffect } from 'react';
import { Stack, SplashScreen, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from 'styled-components/native'; // Opcional, mas bom para contexto

// Serviços e Configurações
import FirebaseService from '../src/services/firebase';
import { queryClient, asyncStoragePersister } from '../src/lib/queryClientConfig';
import { OfflineIndicator } from '../src/components/shared/OfflineIndicator';
import ToastContainer from '../src/components/Toast/ToastContainer';
import { useToastStore } from '../src/services/toastService';
import { socketService } from '../src/services/socketService';
import theme, { colors } from '../src/theme/theme';
import { useUserStore } from '../src/store/useUserStore';

// Impede que a tela de splash suma antes de carregar recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navigationRef = useNavigationContainerRef();
  const user = useUserStore((state) => state.user); // Observar mudanças no usuário

  // 1. Fontes e Carregamento Inicial
  // (Assumindo uso das fontes do sistema para máxima performance e look nativo "clean")
  const [fontsLoaded, fontError] = [true, null];

  // 1.1 Conectar Socket quando usuário logar
  useEffect(() => {
    if (user) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [user]);

  // 2. Hidratar Store do Usuário (Carregar dados salvos)
  useEffect(() => {
    const hydrate = async () => {
      try {
        await useUserStore.getState().hydrate();
        console.log('✅ User store hidratado');
      } catch (err) {
        console.error('❌ Erro ao hidratar user store:', err);
      }
    };
    hydrate();
  }, []);

  // 3. Configurar Firebase Notificações
  useEffect(() => {
    let unsubscribe;
    const setupFirebase = async () => {
      await FirebaseService.registerForPushNotifications();
      unsubscribe = FirebaseService.setupNotificationListeners((notification) => {
        console.log('📬 Notificação recebida:', notification);
        
        // Exibir Toast para notificação recebida em foreground
        const title = notification.request.content.title || 'Nova Notificação';
        const body = notification.request.content.body || 'Você tem uma nova mensagem.';
        
        useToastStore.getState().showToast(`${title}: ${body}`, 'info');
      });
    };
    setupFirebase().catch(err => console.error('Firebase setup error:', err));
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  // 4. Salvar ref de navegação global
  useEffect(() => {
    if (navigationRef) {
      global.navigationRef = navigationRef;
    }
  }, [navigationRef]);

  // Ocultar Splash Screen quando pronto
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          {/* Indicadores Globais de Estado */}
          <OfflineIndicator />
          <ToastContainer />

          {/* 
            StatusBar Configurada para o Tema Clean 
            style="dark" -> Ícones pretos (para fundo claro)
            backgroundColor="transparent" -> Fundo transparente (translucent)
          */}
          <StatusBar style="dark" backgroundColor="transparent" translucent />
          
          <Stack
            screenOptions={{
              headerShown: false,
              // Define o background global da aplicação para evitar flashes brancos/pretos
              contentStyle: { backgroundColor: colors.slate[50] }, 
              animation: 'slide_from_right', // Animação nativa fluida
              // Remove sombras feias do header padrão (caso ele aparecesse)
              headerShadowVisible: false,
            }}
          >
            {/* GRUPO PÚBLICO (Login, Onboarding) */}
            <Stack.Screen 
              name="(public)" 
              options={{ 
                animation: 'fade',
                gestureEnabled: false 
              }} 
            />

            {/* GRUPO PRINCIPAL (Tabs) */}
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                animation: 'fade',
                gestureEnabled: false 
              }} 
            />

            {/* FLUXO DE COMPRA (Booking) */}
            <Stack.Screen 
              name="booking" 
              options={{ 
                presentation: 'card',
                animation: 'slide_from_right',
                // Fundo específico para o fluxo de compra
                contentStyle: { backgroundColor: colors.slate[50] }
              }} 
            />

            {/* MODAIS (Sobem de baixo para cima - Estilo iOS Moderno) */}
            <Stack.Screen 
              name="(modals)" 
              options={{ 
                presentation: 'modal', 
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' }
              }} 
            />
          </Stack>
        </SafeAreaProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}