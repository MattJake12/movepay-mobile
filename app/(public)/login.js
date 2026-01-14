// File: app/(public)/login.js

import React, { useState, useRef } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react-native';
import api from '../../src/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleAuth } from '../../src/hooks/useGoogleAuth';
import { useUserStore } from '../../src/store/useUserStore';
import { Input } from '../../src/components/ui/Input'; // <--- NOVO COMPONENTE
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.white};
`;

const Content = styled.View`
  flex: 1;
  padding-horizontal: ${spacing[6]}px;
  justify-content: center;
`;

const Header = styled.View`
  margin-bottom: ${spacing[10]}px;
`;

const BrandBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
  margin-bottom: ${spacing[4]}px;
`;

const BrandText = styled.Text`
  color: ${colors.brand[600]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Title = styled.Text`
  font-size: ${fontSize['4xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  letter-spacing: -1px;
  line-height: 44px;
  margin-bottom: ${spacing[2]}px;
`;

const Subtitle = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${colors.slate[500]};
  line-height: 24px;
`;

const Form = styled.View`
  gap: ${spacing[5]}px;
`;

const Actions = styled.View`
  margin-top: ${spacing[8]}px;
  gap: ${spacing[4]}px;
`;

const PrimaryButton = styled.TouchableOpacity`
  height: 56px;
  background-color: ${props => props.disabled ? colors.slate[300] : colors.brand[600]};
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]}px;
  ${shadows.md}
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const Divider = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[3]}px;
`;

const Line = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${colors.slate[200]};
`;

const DividerText = styled.Text`
  color: ${colors.slate[400]};
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.medium};
`;

const GoogleButton = styled.TouchableOpacity`
  height: 56px;
  background-color: ${colors.white};
  border-width: 1px;
  border-color: ${colors.slate[200]};
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing[3]}px;
`;

const GoogleButtonText = styled.Text`
  color: ${colors.slate[700]};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.base}px;
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: ${spacing[6]}px;
  gap: ${spacing[1]}px;
`;

const FooterText = styled.Text`
  color: ${colors.slate[500]};
  font-size: ${fontSize.sm}px;
`;

const LinkText = styled.Text`
  color: ${colors.brand[600]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
`;

export default function LoginScreen() {
  const router = useRouter();
  const { handleGoogleSignIn, isLoading: isGoogleLoading } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs para navegação entre campos
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!email || !password) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      // Normalizar email (lowercase) para comparação case-insensitive no backend
      const normalizedEmail = email.trim().toLowerCase();
      
      const response = await api.post('/auth/login', {
        identifier: normalizedEmail,
        password
      });

      const { token, user } = response.data.data;

      // ---------------------------------------------------------
      // 1. Validação de Segurança por Função (Role-Based Access)
      // ---------------------------------------------------------
      const ALLOWED_ROLES = ['CUSTOMER', 'OPERATOR_STAFF'];
      
      // Se não tiver role definida ou não estiver na lista permitida, bloqueia.
      if (!user.role || !ALLOWED_ROLES.includes(user.role)) {
        Alert.alert(
          "Acesso Restrito", 
          "A versão mobile é exclusiva para Passageiros e Operadores.\n\nAdministradores e Gerentes devem usar o Painel Web."
        );
        setIsLoading(false);
        return;
      }

      console.log('✅ [Login] Sucesso. Token:', token ? 'OK' : 'MISSING');
      console.log('✅ [Login] User Data:', JSON.stringify(user, null, 2));

      // Atualizar Zustand store E AsyncStorage
      useUserStore.getState().login(user, token);
      console.log('💾 [Login] Store atualizado com user:', user.name, 'role:', user.role);

      router.replace('/(tabs)/home');

    } catch (error) {
      let titulo = "Erro de Acesso";
      let mensagem = "Não foi possível conectar ao servidor.";
      
      if (error.response) {
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
          mensagem = error.response.data.message;
        }
      }
      Alert.alert(titulo, mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <Content>
              {/* HEADER */}
              <Header>
                <BrandBadge>
                  <ShieldCheck size={20} color={colors.brand[600]} />
                  <BrandText>MovePay</BrandText>
                </BrandBadge>
                <Title>Bem-vindo{'\n'}de volta</Title>
                <Subtitle>Digite seus dados para acessar sua conta.</Subtitle>
              </Header>

              {/* FORMULÁRIO */}
              <Form>
                <Input
                  ref={emailInputRef}
                  label="Email"
                  icon={Mail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />

                <Input
                  ref={passwordInputRef}
                  label="Senha"
                  icon={Lock}
                  placeholder="••••••••"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={handleLogin}
                />
              </Form>

              {/* AÇÕES */}
              <Actions>
                <PrimaryButton onPress={handleLogin} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <ButtonText>Entrar na Conta</ButtonText>
                      <ArrowRight size={20} color={colors.white} />
                    </>
                  )}
                </PrimaryButton>

                <Divider>
                  <Line />
                  <DividerText>ou continue com</DividerText>
                  <Line />
                </Divider>

                <GoogleButton onPress={handleGoogleSignIn} disabled={isGoogleLoading}>
                  {isGoogleLoading ? (
                    <ActivityIndicator size="small" color={colors.slate[600]} />
                  ) : (
                    <GoogleButtonText>Google</GoogleButtonText>
                  )}
                </GoogleButton>
              </Actions>

              {/* FOOTER */}
              <Footer>
                <FooterText>Não tem uma conta?</FooterText>
                <TouchableOpacity onPress={() => router.push('/(public)/register')}>
                  <LinkText>Criar agora</LinkText>
                </TouchableOpacity>
              </Footer>

            </Content>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Container>
  );
}