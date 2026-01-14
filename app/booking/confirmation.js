// File: app/booking/confirmation.js

import React, { useEffect, useRef } from 'react';
import { Animated, View, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import styled from 'styled-components/native';
import { Check, ArrowRight, Home, Download, Share2 } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

const { width } = Dimensions.get('window');

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
  justify-content: center;
  align-items: center;
  padding: ${spacing[6]}px;
`;

const SuccessCircle = styled(Animated.View)`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${colors.green[500]};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[6]}px;
  ${shadows.lg}
`;

const Title = styled.Text`
  font-size: ${fontSize['3xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  text-align: center;
  margin-bottom: ${spacing[2]}px;
`;

const Message = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${colors.slate[500]};
  text-align: center;
  line-height: 24px;
  margin-bottom: ${spacing[10]}px;
`;

const TicketPreview = styled.View`
  width: 100%;
  background-color: ${colors.slate[50]};
  border-radius: 20px;
  padding: ${spacing[6]}px;
  margin-bottom: ${spacing[8]}px;
  border-width: 1px;
  border-color: ${colors.slate[100]};
  align-items: center;
`;

const TicketCode = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.black};
  color: ${colors.slate[800]};
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const TicketLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  margin-top: ${spacing[2]}px;
`;

const ButtonGroup = styled.View`
  width: 100%;
  gap: ${spacing[4]}px;
`;

const PrimaryButton = styled.TouchableOpacity`
  background-color: ${colors.brand[600]};
  height: 56px;
  border-radius: 16px;
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

const SecondaryButton = styled.TouchableOpacity`
  height: 56px;
  border-radius: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]}px;
`;

const SecondaryText = styled.Text`
  color: ${colors.slate[600]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const ActionButtonsRow = styled.View`
  width: 100%;
  flex-direction: row;
  gap: ${spacing[3]}px;
  margin-top: ${spacing[4]}px;
`;

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  background-color: ${colors.slate[100]};
  align-items: center;
  justify-content: center;
`;

export default function ConfirmationScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const handleShareTicket = async () => {
    try {
      const ticketData = {
        code: 'TKT-8842',
        route: 'Luanda → Benguela',
        message: 'Olá! Vou viajar com MovePay. Reserva confirmada: TKT-8842'
      };
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync({
          url: 'movepay://ticket/TKT-8842',
          message: ticketData.message,
          title: 'Meu Bilhete MovePay'
        });
      } else {
        Alert.alert('Compartilhamento', 'Bilhete: TKT-8842\nRota: Luanda → Benguela');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o bilhete');
    }
  };

  const handleDownloadTicket = async () => {
    try {
      Alert.alert(
        '✅ Bilhete Salvo',
        'Seu bilhete foi salvo em Downloads\nCódigo: TKT-8842',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível baixar o bilhete');
    }
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Container>
      <SuccessCircle style={{ transform: [{ scale: scaleAnim }] }}>
        <Check size={48} color={colors.white} strokeWidth={3} />
      </SuccessCircle>

      <Title>Reserva Confirmada!</Title>
      <Message>
        Sua viagem para Benguela está garantida.{'\n'}Enviamos o bilhete para o seu email.
      </Message>

      <TicketPreview>
        <TicketCode>TKT-8842</TicketCode>
        <TicketLabel>Código da Reserva</TicketLabel>
        
        <ActionButtonsRow>
          <ActionButton 
            onPress={handleDownloadTicket}
            accessible={true}
            accessibilityLabel="Baixar bilhete"
            accessibilityRole="button"
          >
            <Download size={20} color={colors.brand[600]} />
          </ActionButton>
          
          <ActionButton 
            onPress={handleShareTicket}
            accessible={true}
            accessibilityLabel="Compartilhar bilhete"
            accessibilityRole="button"
          >
            <Share2 size={20} color={colors.brand[600]} />
          </ActionButton>
        </ActionButtonsRow>
      </TicketPreview>

      <ButtonGroup>
        <PrimaryButton onPress={() => router.push('/(tabs)/my-trips')}>
          <ButtonText>Ver Meus Bilhetes</ButtonText>
          <ArrowRight size={20} color={colors.white} />
        </PrimaryButton>

        <SecondaryButton onPress={() => router.replace('/(tabs)/home')}>
          <Home size={20} color={colors.slate[600]} />
          <SecondaryText>Voltar ao Início</SecondaryText>
        </SecondaryButton>
      </ButtonGroup>
    </Container>
  );
}