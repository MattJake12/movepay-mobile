// File: app/booking/payment.js

import React, { useState } from 'react';
import { ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Lock, ShieldCheck, CreditCard, Wallet, ChevronRight, Zap } from 'lucide-react-native';
import { useCartStore } from '../../src/store/useCartStore';
import { useBooking } from '../../src/hooks/useBooking';
import { useWallet } from '../../src/hooks/useWallet';
import { useToastStore } from '../../src/services/toastService';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';

const formatKz = (v) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);

// ===== STYLED COMPONENTS =====
// ... (STYLES) ...

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: ${spacing[6]}px;
`;

const Header = styled.View`
  margin-bottom: ${spacing[6]}px;
`;

const Title = styled.Text`
  font-size: ${fontSize['2xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  letter-spacing: -0.5px;
`;

const Subtitle = styled.Text`
  color: ${colors.slate[500]};
  margin-top: ${spacing[1]}px;
  font-size: ${fontSize.sm}px;
`;

// Resumo da Ordem (Receipt Style)
const SummaryCard = styled.View`
  background-color: ${colors.white};
  padding: ${spacing[5]}px;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
  margin-bottom: ${spacing[8]}px;
`;

const SummaryRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing[3]}px;
`;

const Label = styled.Text`
  color: ${colors.slate[500]};
  font-size: ${fontSize.sm}px;
`;

const Value = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.sm}px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${colors.slate[100]};
  margin-vertical: ${spacing[3]}px;
  border-style: dashed;
  border-width: 1px;
  border-color: ${colors.slate[200]};
`;

const TotalRow = styled(SummaryRow)`
  margin-bottom: 0;
  align-items: center;
`;

const TotalLabel = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const TotalValue = styled.Text`
  color: ${colors.brand[600]};
  font-weight: ${fontWeight.extrabold};
  font-size: ${fontSize.xl}px;
`;

// Seção de Pagamento
const SectionLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[500]};
  text-transform: uppercase;
  margin-bottom: ${spacing[3]}px;
  letter-spacing: 0.5px;
`;

const MethodCard = styled.View`
  background-color: ${colors.white};
  border-radius: 16px;
  border-width: 1px;
  border-color: ${props => props.selected ? colors.brand[600] : colors.slate[200]};
  padding: ${spacing[5]}px;
  margin-bottom: ${spacing[4]}px;
  position: relative;
  ${props => props.selected && `background-color: ${colors.brand[50]};`}
`;

const MethodHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[3]}px;
  margin-bottom: ${spacing[4]}px;
`;

const MethodIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${colors.white};
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${colors.slate[200]};
`;

const MethodTitle = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

// Input Estilo Bancário
const InputGroup = styled.View`
  gap: ${spacing[2]}px;
`;

const InputLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[600]};
  margin-left: 2px;
`;

const PhoneInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  height: 56px;
  background-color: ${colors.white};
  border-width: 1px;
  border-color: ${colors.slate[300]};
  border-radius: 12px;
  padding-horizontal: ${spacing[4]}px;
`;

const CountryCode = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[500]};
  margin-right: ${spacing[3]}px;
`;

const PhoneInput = styled(TextInput)`
  flex: 1;
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  letter-spacing: 1px;
`;

const LockInfo = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]}px;
  margin-top: ${spacing[6]}px;
`;

const LockText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
`;

// Footer
const Footer = styled.View`
  padding: ${spacing[6]}px;
  padding-bottom: ${spacing[8]}px;
  background-color: ${colors.white};
  border-top-width: 1px;
  border-top-color: ${colors.slate[100]};
`;

const PayButton = styled.TouchableOpacity`
  background-color: ${colors.slate[900]};
  height: 56px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing[3]}px;
  ${shadows.md}
`;

const PayButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

export default function PaymentScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('MULTICAIXA_EXPRESS');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const trip = useCartStore((state) => state.trip);
  const selectedSeats = useCartStore((state) => state.selectedSeats);
  const total = useCartStore((state) => state.getTotal());
  const { createBooking } = useBooking();
  const { wallet } = useWallet();

  const handlePay = async () => {
    // Validações
    if (selectedMethod === 'WALLET') {
      if (!wallet || wallet.balance < total) {
        useToastStore.getState().showToast(`Saldo insuficiente. Você tem ${formatKz(wallet?.balance || 0)}`, 'error');
        return;
      }
    } else {
      // Para Multicaixa/Unitel exige telefone
      if (phone.length < 9) {
        useToastStore.getState().showToast(`Insira um número válido para ${selectedMethod === 'MULTICAIXA_EXPRESS' ? 'Multicaixa Express' : 'Unitel Money'}`, 'warning');
        return;
      }
    }

    setIsProcessing(true);
    // Simulação de processamento
    try {
      if (selectedMethod !== 'WALLET') {
         // Simular delay de processamento MCX/Unitel
         useToastStore.getState().showToast('Processando pagamento...', 'info');
         await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      await createBooking.mutateAsync({
        tripId: trip.id,
        selectedSeats,
        paymentMethod: selectedMethod === 'WALLET' ? 'WALLET' : selectedMethod
      });
      
      useToastStore.getState().showToast('Pagamento confirmado com sucesso!', 'success');
      router.replace('/booking/confirmation');
    } catch (error) {
      const msg = error.response?.data?.message || "Falha ao processar pagamento.";
      useToastStore.getState().showToast(msg, 'error');
      setIsProcessing(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Content showsVerticalScrollIndicator={false}>
          <Header>
            <Title>Pagamento</Title>
            <Subtitle>Finalize sua reserva com segurança.</Subtitle>
          </Header>

          {/* Resumo */}
          <SectionLabel>Resumo</SectionLabel>
          <SummaryCard>
            <SummaryRow>
              <Label>Trajeto</Label>
              <Value>{trip?.origin} → {trip?.destination}</Value>
            </SummaryRow>
            <SummaryRow>
              <Label>Passageiros</Label>
              <Value>{selectedSeats.length} Pessoas</Value>
            </SummaryRow>
            <Divider />
            <TotalRow>
              <TotalLabel>Total a Pagar</TotalLabel>
              <TotalValue>{formatKz(total)}</TotalValue>
            </TotalRow>
          </SummaryCard>

          {/* Método */}
          <SectionLabel>Método de Pagamento</SectionLabel>

          {/* 1. Carteira MovePay (NOVO) */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedMethod('WALLET')}>
            <MethodCard selected={selectedMethod === 'WALLET'}>
              <MethodHeader>
                <MethodIcon>
                  <Zap size={24} color={colors.brand[600]} />
                </MethodIcon>
                <View style={{ flex: 1 }}>
                    <MethodTitle>Carteira MovePoints</MethodTitle>
                    <Value style={{ color: wallet?.balance >= total ? colors.green[600] : colors.red[500], fontSize: 13, marginTop: 4 }}>
                      Saldo: {wallet?.balance ? formatKz(wallet.balance) : 'Carregando...'}
                    </Value>
                </View>
                {selectedMethod === 'WALLET' && (
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center' }}>
                         <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />
                    </View>
                )}
              </MethodHeader>
              
              {selectedMethod === 'WALLET' && wallet?.balance < total && (
                 <Value style={{ color: colors.red[500], fontSize: 12, marginTop: -10, marginBottom: 10 }}>
                    Saldo insuficiente. Por favor carregue sua carteira ou escolha outro método.
                 </Value>
              )}
            </MethodCard>
          </TouchableOpacity>
          
          {/* Multicaixa Express */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedMethod('MULTICAIXA_EXPRESS')}>
            <MethodCard selected={selectedMethod === 'MULTICAIXA_EXPRESS'}>
              <MethodHeader>
                <MethodIcon>
                  <Smartphone size={24} color={colors.blue[600]} />
                </MethodIcon>
                <MethodTitle>Multicaixa Express</MethodTitle>
              </MethodHeader>

              {selectedMethod === 'MULTICAIXA_EXPRESS' && (
                <InputGroup>
                  <InputLabel>NÚMERO DE TELEFONE</InputLabel>
                  <PhoneInputContainer>
                    <CountryCode>+244</CountryCode>
                    <PhoneInput 
                      placeholder="923 000 000" 
                      placeholderTextColor={colors.slate[300]}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </PhoneInputContainer>
                </InputGroup>
              )}
            </MethodCard>
          </TouchableOpacity>

          {/* Unitel Money */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedMethod('UNITEL_MONEY')}>
            <MethodCard selected={selectedMethod === 'UNITEL_MONEY'}>
              <MethodHeader>
                <MethodIcon>
                  <Wallet size={24} color={colors.orange[600]} />
                </MethodIcon>
                <MethodTitle>Unitel Money</MethodTitle>
              </MethodHeader>

              {selectedMethod === 'UNITEL_MONEY' && (
                <InputGroup>
                  <InputLabel>NÚMERO UNITEL MONEY</InputLabel>
                  <PhoneInputContainer>
                    <CountryCode>+244</CountryCode>
                    <PhoneInput 
                      placeholder="923 000 000" 
                      placeholderTextColor={colors.slate[300]}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </PhoneInputContainer>
                </InputGroup>
              )}
            </MethodCard>
          </TouchableOpacity>


          <TouchableOpacity activeOpacity={0.9} style={{ opacity: 0.6 }} onPress={() => Alert.alert('Em breve', 'Pagamento com cartão estará disponível em breve.')}>
            <MethodCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MethodIcon>
                    <CreditCard size={24} color={colors.slate[400]} />
                  </MethodIcon>
                  <MethodTitle style={{ color: colors.slate[500] }}>Cartão VISA / Mastercard</MethodTitle>
                </View>
                <ChevronRight size={20} color={colors.slate[300]} />
              </View>
            </MethodCard>
          </TouchableOpacity>

          <LockInfo>
            <Lock size={14} color={colors.slate[400]} />
            <LockText>Pagamento encriptado de ponta a ponta.</LockText>
          </LockInfo>

        </Content>

        <Footer>
          <PayButton onPress={handlePay} disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <ShieldCheck size={20} color={colors.white} />
                <PayButtonText>Pagar {formatKz(total)}</PayButtonText>
              </>
            )}
          </PayButton>
        </Footer>
      </KeyboardAvoidingView>
    </Container>
  );
}