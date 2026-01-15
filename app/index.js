// File: app/index.js

import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { colors } from '../src/theme/theme';

// ===== STYLED COMPONENTS =====
const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${colors.brand[600]};
`;

const LoadingText = styled.Text`
  color: ${colors.white};
  margin-top: 16px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 1px;
`;

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Simulação de verificação de token (Substituiremos pelo AsyncStorage real depois)
    const checkToken = async () => {
      try {
        // const token = await AsyncStorage.getItem('movepay_token');
        const token = null; // Mude para "123" para testar a rota logada
        setUserToken(token);
      } catch (e) {
        console.error(e);
      } finally {
        // Pequeno delay fake para não piscar muito rápido (sensação de processamento)
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    checkToken();
  }, []);

  // Tela de Loading Bonita (Enquanto decide)
  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color={colors.white} />
        <LoadingText>MovePay</LoadingText>
      </LoadingContainer>
    );
  }

  // Redirecionamento
  // Se tem token -> Vai para as Tabs (Home)
  // Se não tem -> Vai para o fluxo Público (Login/Onboarding)
  return <Redirect href={userToken ? "/(tabs)/home" : "/(public)/login"} />;
}