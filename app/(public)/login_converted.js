// File: app/(public)/login_converted.js

import React, { useState } from 'react';
import { 
  View,
  Text,
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react-native';
import api from '../../src/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleAuth } from '../../src/hooks/useGoogleAuth';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orbDecoration: {
    position: 'absolute',
    borderRadius: 9999,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  brandTitle: {
    color: colors.white,
    fontWeight: fontWeight.extrabold,
    fontSize: 36,
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  badgeText: {
    color: 'rgba(217, 119, 250, 1)',
    fontSize: fontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginLeft: spacing[1],
    textTransform: 'uppercase',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 32,
    padding: spacing[6],
    gap: spacing[5],
  },
  inputGroup: {
    gap: spacing[2],
  },
  inputLabel: {
    color: 'rgba(217, 119, 250, 0.8)',
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginLeft: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainerFocused: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.brand[400],
  },
  inputIcon: {
    marginRight: spacing[3],
  },
  styledInput: {
    flex: 1,
    color: colors.white,
    fontWeight: '500',
    fontSize: fontSize.base,
  },
  passwordToggleButton: {
    marginLeft: spacing[2],
  },
  loginButton: {
    backgroundColor: colors.brand[600],
    borderRadius: 12,
    paddingVertical: spacing[4],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginVertical: spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: fontSize.sm,
  },
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: spacing[4],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
  googleButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[6],
  },
  registerLinkText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: fontSize.sm,
  },
  registerButtonText: {
    color: colors.brand[300],
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});

export default function LoginScreen() {
  const router = useRouter();
  const { handleGoogleSignIn, isLoading: isGoogleLoading, error: googleError } = useGoogleAuth();
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(null); // 'email' | 'password' | null

  // Dados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    // Validação básica antes de chamar o servidor
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      // Normalizar email (lowercase) para comparação case-insensitive no backend
      const normalizedEmail = email.trim().toLowerCase();
      
      // 🚀 A CHAMADA REAL AO BACKEND
      const response = await api.post('/auth/login', {
        identifier: normalizedEmail,
        password: password
      });

      // Se chegou aqui, o login foi sucesso (200 OK)
      const { token, user } = response.data.data;

      // 💾 Salvar sessão no telemóvel
      await AsyncStorage.setItem('movepay_token', token);
      await AsyncStorage.setItem('movepay_user', JSON.stringify(user));

      // Redirecionar
      router.replace('/(tabs)/home');

    } catch (error) {
      console.log(error); // Para você ver o erro no terminal
      
      let titulo = "Erro de Acesso";
      let mensagem = "Não foi possível conectar ao servidor.";
      
      if (error.response) {
        // Erro veio do backend
        mensagem = error.response.data.message || "Credenciais inválidas.";
        
        // Melhorar mensagens de erro específicas
        if (mensagem.includes("não encontrado")) {
          titulo = "Email não encontrado";
          mensagem = "Este email não está registado. Verifique ou crie uma nova conta.";
        } else if (mensagem.includes("incorreta")) {
          titulo = "Senha incorreta";
          mensagem = "A palavra-passe está incorreta. Tente novamente.";
        } else if (mensagem.includes("Google")) {
          titulo = "Conta do Google";
        }
      } else if (error.request) {
        // Erro de rede (IP errado ou servidor desligado)
        titulo = "Sem conexão";
        mensagem = "Servidor indisponível. Verifique sua conexão ou o IP da API.";
      }

      Alert.alert(titulo, mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* 1. BACKGROUND PREMIUM */}
        <LinearGradient
          colors={['#2e1065', '#4c1d95', '#5b21b6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        />

        {/* Efeitos de Luz de Fundo (Orbs) */}
        <View 
          style={[
            styles.orbDecoration,
            { top: -100, left: -50, width: 300, height: 300, backgroundColor: 'rgba(167, 139, 250, 0.2)' }
          ]}
        />
        <View 
          style={[
            styles.orbDecoration,
            { bottom: -50, right: -50, width: 300, height: 300, backgroundColor: 'rgba(167, 139, 250, 0.1)' }
          ]}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
          
          {/* 2. HEADER: Marca e Boas-vindas */}
          <View style={styles.headerSection}>
            {/* Ícone da Marca */}
            <View style={styles.brandIcon}>
              <ShieldCheck size={32} color={colors.white} />
            </View>
            
            <Text style={styles.brandTitle}>MovePay</Text>
            
            <View style={styles.brandBadge}>
              <Sparkles size={12} color="rgba(217, 119, 250, 1)" />
              <Text style={styles.badgeText}>Operations Suite Mobile</Text>
            </View>
          </View>

          {/* 3. FORMULÁRIO */}
          <View style={styles.formCard}>
            
            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={isFocused === 'email' ? styles.inputContainerFocused : styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color={isFocused === 'email' ? colors.brand[400] : colors.slate[400]} />
                </View>
                <TextInput
                  style={styles.styledInput}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.slate[400]}
                  keyboardType="email-address"
                  maxLength={254}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                />
              </View>
            </View>

            {/* Input Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={isFocused === 'password' ? styles.inputContainerFocused : styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color={isFocused === 'password' ? colors.brand[400] : colors.slate[400]} />
                </View>
                <TextInput
                  style={styles.styledInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.slate[400]}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                />
                <TouchableOpacity style={styles.passwordToggleButton} onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.slate[400]} />
                  ) : (
                    <Eye size={20} color={colors.slate[400]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Login */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Entrar</Text>
                  <ArrowRight size={18} color={colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 4. SEPARADOR OU */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 5. GOOGLE LOGIN */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={isGoogleLoading}>
            {isGoogleLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.googleButtonText}>Continuar com Google</Text>
            )}
          </TouchableOpacity>

          {/* 6. LINK PARA REGISTRAR */}
          <View style={styles.registerLink}>
            <Text style={styles.registerLinkText}>Não tem conta?</Text>
            <TouchableOpacity onPress={() => router.push('/(public)/register')}>
              <Text style={styles.registerButtonText}>Registre-se aqui</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
