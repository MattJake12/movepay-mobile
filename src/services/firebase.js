// File: src/services/firebase.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';

/**
 * 📱 Nota sobre Notificações Push em Expo Go
 * 
 * Expo Go SDK 54+ não suporta notificações push remotas
 * Para usar notificações push, você precisa criar um desenvolvimento build com EAS:
 * 
 * eas build --platform android --profile preview
 * 
 * Em Expo Go, você pode usar WebSocket para simular atualizações em tempo real
 * Veja: src/services/websocket.js
 */

class FirebaseService {
  constructor() {
    this.deviceToken = null;
    this.notificationListeners = [];
  }

  /**
   * Registrar device para receber notificações
   * 
   * ⚠️ Em Expo Go: Notificações push não funcionam
   *    Use desenvolvimento build ou WebSocket para simular em tempo real
   */
  async registerForPushNotifications() {
    try {
      console.info('ℹ️ Push notifications não disponível em Expo Go');
      console.info('   Para usar: eas build --platform android --profile preview');
      return null;
    } catch (error) {
      console.error('❌ Erro ao registrar notificações:', error);
      return null;
    }
  }

  /**
   * Sincronizar device token com backend
   * 
   * ⚠️ Em Expo Go: Este método não faz nada, pois não há token
   *    Use WebSocket para sincronizar dados em tempo real
   */
  async syncDeviceTokenWithBackend(deviceToken) {
    // Stub method - notificações não disponível em Expo Go
    return;
  }

  /**
   * Configurar listeners de notificações
   * 
   * ⚠️ Em Expo Go: Notificações remotas não funcionam
   *    Use WebSocket ou polling para atualizações em tempo real
   */
  async setupNotificationListeners(onNotificationReceived) {
    console.info('ℹ️ Para notificações em tempo real em Expo Go, use WebSocket');
    return () => {}; // Return empty unsubscribe function
  }

  /**
   * Remover device token (logout)
   * 
   * ⚠️ Em Expo Go: Este método não faz nada
   */
  async unregisterDeviceToken() {
    // Stub method - notificações não disponível em Expo Go
    return;
  }

  /**
   * Enviar notificação de teste (para dev)
   * 
   * ⚠️ Em Expo Go: Este método não funciona
   *    Use desenvolvimento build ou teste no backend
   */
  async sendTestNotification() {
    console.warn('⚠️ Notificações de teste não disponível em Expo Go');
    return null;
  }
}

export default new FirebaseService();
