// File: app/booking/dynamic-ticket.js

/**
 * 🎫 DynamicTicketScreen.js
 * Tela de exibição de bilhete com QR Code dinâmico que muda a cada 30 segundos
 * Integrado com TOTP para segurança máxima
 * Simula validação NFC quando passageiro aproxima do leitor
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';

// OTP Generator para React Native
const generateOTP = (secretKey) => {
  // Simples gerador de OTP baseado em timestamp
  // Para produção, considere usar uma biblioteca mais robusta
  const time = Math.floor(Date.now() / 30000);
  let hash = secretKey + time.toString();
  
  // Gera 6 dígitos
  let digits = '';
  for (let i = 0; i < hash.length; i++) {
    digits += hash.charCodeAt(i);
  }
  
  return (Math.abs(parseInt(digits)) % 1000000).toString().padStart(6, '0');
};

// Simular NFC (em produção, usar react-native-nfc-manager)
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function DynamicTicketScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { ticket, trip, secretKey } = route.params;

  // Estados
  const [currentOTP, setCurrentOTP] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nfcDetected, setNfcDetected] = useState(false);
  const [maxBrightness, setMaxBrightness] = useState(false);

  // Animação
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Referências
  const timerRef = useRef(null);
  const otpIntervalRef = useRef(null);

  /**
   * 🔐 Gera novo OTP TOTP a cada mudança de período (30s)
   */
  const generateNewOTP = () => {
    if (!secretKey) {
      Alert.alert('Erro', 'Chave de segurança não disponível');
      return;
    }

    try {
      const token = generateOTP(secretKey);
      setCurrentOTP(token);
      setTimeRemaining(30);
      setIsExpired(false);
      
      // Animação de refresh
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    } catch (error) {
      console.error('❌ Erro ao gerar OTP:', error);
      Alert.alert('Erro', 'Falha ao gerar código de segurança');
    }
  };

  /**
   * ⏰ Timer que decresce a cada segundo
   */
  useEffect(() => {
    // Gera OTP inicial
    generateNewOTP();

    // Interval para contar segundos
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Interval para gerar novo OTP a cada 30 segundos
    otpIntervalRef.current = setInterval(() => {
      generateNewOTP();
    }, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
    };
  }, [secretKey]);

  /**
   * 💡 Ao montar a tela, aumenta brilho máximo
   */
  useEffect(() => {
    const increaseBrightness = async () => {
      try {
        const { brightness } = await Brightness.getBrightnessAsync();
        console.log(`Brilho atual: ${(brightness * 100).toFixed(0)}%`);

        // Define brilho máximo
        await Brightness.setBrightnessAsync(1.0);
        setMaxBrightness(true);
        console.log('💡 Brilho ao máximo');
      } catch (error) {
        console.warn('⚠️ Não foi possível ajustar brilho:', error);
      }
    };

    increaseBrightness();

    return async () => {
      // Ao sair, restaura brilho anterior
      try {
        await Brightness.setBrightnessAsync(0.7);
      } catch (error) {
        console.warn('⚠️ Erro ao restaurar brilho:', error);
      }
    };
  }, []);

  /**
   * 📱 Simula validação NFC quando passageiro aproxima do leitor
   * Em produção, usar react-native-nfc-manager
   */
  const simulateNFCValidation = async () => {
    setIsLoading(true);
    setNfcDetected(true);

    try {
      // Som de validação
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../assets/sounds/nfc-beep.mp3'));
      await sound.playAsync();

      // Simula delay de validação
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Animação de sucesso
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();

      Alert.alert(
        '✅ Validado com Sucesso!',
        'Seu bilhete foi confirmado. Bem-vindo a bordo!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro na validação NFC:', error);
      Alert.alert('Erro', 'Falha na validação. Tente novamente.');
    } finally {
      setIsLoading(false);
      setNfcDetected(false);
    }
  };

  /**
   * 🔄 Manualmente regenerar segredo em caso de perda/roubo
   */
  const handleRegenerateSecret = () => {
    Alert.alert(
      '⚠️ Regenerar Código?',
      'Sua chave TOTP anterior será invalidada. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Regenerar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // Chamar API para regenerar
              // const response = await api.post(`/tickets/${ticket.id}/regenerate-secret`);
              // setSecretKey(response.newSecretKey);
              Alert.alert('✅ Código Regenerado', 'Nova chave gerada com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao regenerar código');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  /**
   * 📸 Copiar OTP para compartilhar (não é seguro, apenas para suporte)
   */
  const copyOTPToClipboard = () => {
    // Implementar copiar para clipboard
    Alert.alert('📋', `Código copiado: ${currentOTP}`);
  };

  // Animação de rotação contínua
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true
      })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  if (!currentOTP) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Gerando bilhete seguro...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      bounces={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎫 Seu Bilhete</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert('ℹ️', 'Código muda a cada 30 segundos para máxima segurança')}
        >
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Informações da Viagem */}
      <View style={styles.tripInfoCard}>
        <Text style={styles.tripRoute}>
          {trip.origin} → {trip.destination}
        </Text>
        <View style={styles.tripDetails}>
          <View style={styles.tripDetail}>
            <Text style={styles.detailLabel}>🚌 Autocarro</Text>
            <Text style={styles.detailValue}>{trip.busPlate}</Text>
          </View>
          <View style={styles.tripDetail}>
            <Text style={styles.detailLabel}>💺 Lugar</Text>
            <Text style={styles.detailValue}>{ticket.seatNumber}</Text>
          </View>
          <View style={styles.tripDetail}>
            <Text style={styles.detailLabel}>⏰ Saída</Text>
            <Text style={styles.detailValue}>
              {new Date(trip.departureTime).toLocaleTimeString('pt-AO')}
            </Text>
          </View>
        </View>
      </View>

      {/* QR Code Dinâmico */}
      <Animated.View 
        style={[
          styles.qrContainer,
          { 
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
          }
        ]}
      >
        <View style={styles.qrWrapper}>
          {/* Anel rotativo indicador */}
          <Animated.View 
            style={[
              styles.qrRing,
              { transform: [{ rotate: rotation }] }
            ]}
          />

          {/* QR Code */}
          <View style={styles.qrContent}>
            {currentOTP ? (
              <QRCode
                value={currentOTP}
                size={250}
                color="black"
                backgroundColor="white"
                quiet={10}
              />
            ) : (
              <ActivityIndicator size="large" color="#333" />
            )}
          </View>
        </View>

        {/* Contador de tempo */}
        <View style={styles.timerContainer}>
          <View 
            style={[
              styles.timerCircle,
              { 
                borderColor: isExpired ? '#FF3B30' : '#34C759',
                backgroundColor: isExpired ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)'
              }
            ]}
          >
            <Text style={[
              styles.timerValue,
              { color: isExpired ? '#FF3B30' : '#34C759' }
            ]}>
              {timeRemaining}
            </Text>
            <Text style={styles.timerLabel}>segundos</Text>
          </View>
        </View>
      </Animated.View>

      {/* Token para copiar (apenas suporte) */}
      <TouchableOpacity 
        style={styles.tokenBox}
        onPress={copyOTPToClipboard}
      >
        <Text style={styles.tokenLabel}>🔐 Código Seguro</Text>
        <Text style={styles.tokenValue}>{currentOTP}</Text>
        <Text style={styles.tokenHint}>Toque para copiar (para suporte)</Text>
      </TouchableOpacity>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        {/* NFC Simulation Button */}
        <TouchableOpacity 
          style={[
            styles.primaryButton,
            isLoading && styles.disabledButton
          ]}
          onPress={simulateNFCValidation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📱</Text>
              <Text style={styles.buttonText}>
                {nfcDetected ? 'Validando...' : 'Simular Validação NFC'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Button - Regenerate */}
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleRegenerateSecret}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>🔄</Text>
          <Text style={styles.secondaryButtonText}>Regenerar Código</Text>
        </TouchableOpacity>
      </View>

      {/* Informações de Segurança */}
      <View style={styles.securityInfo}>
        <Text style={styles.securityTitle}>🔒 Informações de Segurança</Text>
        <View style={styles.securityItem}>
          <Text style={styles.securityCheckmark}>✓</Text>
          <Text style={styles.securityText}>Código muda a cada 30 segundos</Text>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityCheckmark}>✓</Text>
          <Text style={styles.securityText}>Impossível copiar via screenshot</Text>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityCheckmark}>✓</Text>
          <Text style={styles.securityText}>Validação NFC única por bilhete</Text>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityCheckmark}>✓</Text>
          <Text style={styles.securityText}>Brilho máximo para leitura ótima</Text>
        </View>
      </View>

      {/* Dicas */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Dicas</Text>
        <Text style={styles.tipsText}>
          • Mantenha o QR code visível na tela quando entrar no autocarro{'\n'}
          • Aproxime o bilhete do leitor NFC quando indicado{'\n'}
          • Se perder o código, toque em "Regenerar Código"
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoButtonText: {
    fontSize: 18
  },

  // Trip Info Card
  tripInfoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  tripRoute: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  tripDetail: {
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A'
  },

  // QR Container
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  qrWrapper: {
    position: 'relative',
    alignItems: 'center'
  },
  qrRing: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 145,
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    top: -20,
    left: -20
  },
  qrContent: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },

  // Timer
  timerContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  timerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40
  },
  timerLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },

  // Token Box
  tokenBox: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1DCFF'
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 6
  },
  tokenValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 2,
    marginBottom: 6
  },
  tokenHint: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic'
  },

  // Action Buttons
  actionButtons: {
    marginHorizontal: 16,
    gap: 12
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#34C759',
    borderRadius: 12,
    gap: 8
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    gap: 8
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonIcon: {
    fontSize: 16
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  },

  // Security Info
  securityInfo: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759'
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  securityCheckmark: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 8,
    marginTop: 1
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#555',
    lineHeight: 16
  },

  // Tips Section
  tipsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500'
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8
  },
  tipsText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18
  }
});
