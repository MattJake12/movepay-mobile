// File: app/(public)/register.js

import React, { useState, useRef } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  ArrowLeft, 
  ArrowRight 
} from 'lucide-react-native';
import api from '../../src/lib/api';
import { Input } from '../../src/components/ui/Input'; // <--- USANDO O NOVO COMPONENTE
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.white};
`;

const HeaderContainer = styled.View`
  padding-horizontal: ${spacing[6]}px;
  padding-top: ${spacing[4]}px;
  margin-bottom: ${spacing[6]}px;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.slate[50]};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[6]}px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
`;

const Title = styled.Text`
  font-size: ${fontSize['3xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  letter-spacing: -0.5px;
  margin-bottom: ${spacing[2]}px;
`;

const Subtitle = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${colors.slate[500]};
`;

const FormContainer = styled.View`
  padding-horizontal: ${spacing[6]}px;
  padding-bottom: ${spacing[8]}px;
  gap: ${spacing[5]}px;
`;

const RegisterButton = styled.TouchableOpacity`
  height: 56px;
  background-color: ${props => props.disabled ? colors.slate[300] : colors.brand[600]};
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]}px;
  margin-top: ${spacing[4]}px;
  ${shadows.md}
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: ${spacing[2]}px;
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

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Refs para navegação entre campos
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const biNumberInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Removido o estado 'focus' que causava o problema de re-render
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    biNumber: '',
    password: ''
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    if (!formData.name || !formData.email || !formData.password || !formData.biNumber) {
      Alert.alert("Atenção", "Todos os campos são obrigatórios.");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Segurança", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Validar email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Email inválido", "Por favor, insira um email válido.");
      return;
    }

    setIsLoading(true);

    try {
      // Normalizar email (lowercase) e BINumber (uppercase)
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        biNumber: formData.biNumber.toUpperCase()
      });

      Alert.alert(
        "Conta Criada!", 
        "Sua conta foi criada com sucesso. Faça login para continuar.",
        [
          { text: "Ir para Login", onPress: () => router.replace('/(public)/login') }
        ]
      );

    } catch (error) {
      let titulo = "Erro";
      let msg = "Erro ao criar conta. Tente novamente.";
      
      if (error.response?.data?.message) {
        msg = error.response.data.message;
        
        // Mensagens de erro mais específicas
        if (msg.includes("email") && msg.includes("uso")) {
          titulo = "Email já cadastrado";
          msg = "Este email já está registado. Tente outro ou faça login.";
        } else if (msg.includes("telefone") && msg.includes("uso")) {
          titulo = "Telefone já cadastrado";
          msg = "Este telefone já está registado. Tente outro.";
        }
      }
      
      Alert.alert(titulo, msg);
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
          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* HEADER */}
            <HeaderContainer>
              <BackButton onPress={() => router.back()}>
                <ArrowLeft size={20} color={colors.slate[900]} />
              </BackButton>
              <Title>Criar Conta</Title>
              <Subtitle>Junte-se à MovePay e viaje melhor.</Subtitle>
            </HeaderContainer>

            {/* FORMULÁRIO */}
            <FormContainer>
              
              <Input
                ref={nameInputRef}
                label="Nome Completo"
                icon={User}
                placeholder="João da Silva"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => phoneInputRef.current?.focus()}
              />

              <Input
                ref={emailInputRef}
                label="Email"
                icon={Mail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => biNumberInputRef.current?.focus()}
              />

              <Input
                ref={biNumberInputRef}
                label="Número de BI"
                icon={CreditCard}
                placeholder="00123456789AB"
                value={formData.biNumber}
                onChangeText={(value) => handleChange('biNumber', value)}
                autoCapitalize="characters"
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
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleRegister}
              />

              <RegisterButton onPress={handleRegister} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <ButtonText>Criar Conta</ButtonText>
                    <ArrowRight size={20} color={colors.white} />
                  </>
                )}
              </RegisterButton>

              <Footer>
                <FooterText>Já tem uma conta?</FooterText>
                <TouchableOpacity onPress={() => router.replace('/(public)/login')}>
                  <LinkText>Entre aqui</LinkText>
                </TouchableOpacity>
              </Footer>

            </FormContainer>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Container>
  );
}