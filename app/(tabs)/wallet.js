// File: app/(tabs)/wallet.js

import React, { useState } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, History, ArrowUpRight, Zap, CreditCard } from 'lucide-react-native';
import { useWallet } from '../../src/hooks/useWallet';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, spacing, fontSize, fontWeight, shadows, borderRadius } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  padding: ${spacing[6]}px;
`;

const Title = styled.Text`
  font-size: ${fontSize['3xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const Subtitle = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[500]};
  margin-top: 4px;
`;

// Cartão Platinum (Matte Dark)
const CardContainer = styled.View`
  margin-horizontal: ${spacing[6]}px;
  margin-bottom: ${spacing[8]}px;
  height: 220px;
  border-radius: 24px;
  overflow: hidden;
  ${shadows.lg}
`;

const CardBackground = styled(LinearGradient).attrs({
  // Gradiente Preto Fosco / Chumbo
  colors: ['#1e293b', '#0f172a', '#000000'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  flex: 1;
  padding: ${spacing[6]}px;
  justify-content: space-between;
`;

// Detalhes do Cartão
const CardTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const ChipIcon = styled.View`
  width: 40px;
  height: 28px;
  background-color: #fbbf24; /* Ouro */
  border-radius: 6px;
  opacity: 0.8;
`;

const BrandIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255,255,255,0.1);
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(255,255,255,0.2);
`;

const BalanceLabel = styled.Text`
  color: rgba(255,255,255,0.5);
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.medium};
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const BalanceValue = styled.Text`
  color: ${colors.white};
  font-size: 36px;
  font-weight: ${fontWeight.bold};
  letter-spacing: -1px;
`;

const CardBottom = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const CardHolder = styled.View``;

const HolderLabel = styled.Text`
  color: rgba(255,255,255,0.5);
  font-size: 9px;
  font-weight: ${fontWeight.bold};
  margin-bottom: 2px;
`;

const HolderName = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.medium};
  letter-spacing: 1px;
`;

const TierBadge = styled.View`
  background-color: rgba(255,255,255,0.15);
  padding-horizontal: 10px;
  padding-vertical: 4px;
  border-radius: 12px;
  border-width: 1px;
  border-color: rgba(255,255,255,0.3);
`;

const TierText = styled.Text`
  color: ${colors.white};
  font-size: 10px;
  font-weight: ${fontWeight.bold};
`;

// Menu de Ações
const ActionsGrid = styled.View`
  flex-direction: row;
  padding-horizontal: ${spacing[6]}px;
  gap: ${spacing[4]}px;
  margin-bottom: ${spacing[8]}px;
`;

const ActionItem = styled.TouchableOpacity`
  flex: 1;
  background-color: ${colors.white};
  padding: ${spacing[4]}px;
  border-radius: 16px;
  align-items: center;
  border-width: 1px;
  border-color: ${colors.slate[100]};
  ${shadows.sm}
`;

const ActionIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props => props.bg};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[2]}px;
`;

const ActionLabel = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[700]};
`;

// Lista de Histórico
const HistorySection = styled.View`
  padding-horizontal: ${spacing[6]}px;
  flex: 1;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${spacing[4]}px;
  gap: ${spacing[2]}px;
`;

const SectionTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const TransactionItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${spacing[3]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
`;

const TransIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.slate[50]};
  align-items: center;
  justify-content: center;
  margin-right: ${spacing[3]}px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
`;

const TransInfo = styled.View`
  flex: 1;
`;

const TransTitle = styled.Text`
  font-size: ${fontSize.sm}px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[900]};
`;

const TransDate = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  margin-top: 2px;
`;

const TransAmount = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${props => props.positive ? colors.green[600] : colors.slate[900]};
`;

export default function WalletScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const user = useUserStore(state => state.user);
  
  // Usando o Hook padronizado
  const { wallet, refetchWallet, isLoadingWallet } = useWallet();
  const hydrateUser = useUserStore(state => state.hydrate);

  // Forçar atualização do user ao abrir a aba
  React.useEffect(() => {
    hydrateUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWallet(), hydrateUser()]);
    setRefreshing(false);
  };

  // Helper seguro para datas
  const formatDate = (dateString) => {
    if (!dateString) return 'Recente';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'long' });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Header>
          <Title>Minha Carteira</Title>
          <Subtitle>Use seu saldo para pagar viagens e serviços.</Subtitle>
        </Header>

        {/* CARTÃO PLATINUM */}
        <CardContainer>
          <CardBackground>
            <CardTop>
              <ChipIcon />
              <BrandIcon>
                <Crown size={20} color={colors.white} />
              </BrandIcon>
            </CardTop>

            <View>
              <BalanceLabel>SALDO DISPONÍVEL</BalanceLabel>
              <BalanceValue>{wallet?.balance?.toLocaleString('pt-AO') || '0'} pts</BalanceValue>
            </View>

            <CardBottom>
              <CardHolder>
                <HolderLabel>TITULAR</HolderLabel>
                <HolderName>{(user?.name || 'Cliente MovePay').toUpperCase()}</HolderName>
              </CardHolder>
              <TierBadge>
                <TierText>{wallet?.tier || 'MEMBER'} TIER</TierText>
              </TierBadge>
            </CardBottom>
          </CardBackground>
        </CardContainer>

        {/* ACTIONS */}
        <ActionsGrid>
          <ActionItem 
            activeOpacity={0.7}
            onPress={() => router.push('/(modals)/wallet-transfer')}
          >
            <ActionIcon bg={colors.blue[50]}>
              <ArrowUpRight size={24} color={colors.blue[600]} />
            </ActionIcon>
            <ActionLabel>Transferir</ActionLabel>
          </ActionItem>

          <ActionItem 
            activeOpacity={0.7}
            onPress={() => router.push('/(modals)/wallet-topup')}
          >
            <ActionIcon bg={colors.green[50]}>
              <CreditCard size={24} color={colors.green[600]} />
            </ActionIcon>
            <ActionLabel>Carregar</ActionLabel>
          </ActionItem>

          <ActionItem 
            activeOpacity={0.7}
            onPress={() => router.push('/wallet/history')}
          >
            <ActionIcon bg={colors.purple[50]}>
              <Zap size={24} color={colors.brand[600]} />
            </ActionIcon>
            <ActionLabel>Histórico</ActionLabel>
          </ActionItem>
        </ActionsGrid>

        {/* HISTÓRICO CLEAN */}
        <HistorySection>
          <SectionHeader>
            <History size={18} color={colors.slate[900]} />
            <SectionTitle>Atividade Recente</SectionTitle>
          </SectionHeader>

          {wallet?.history && wallet.history.length > 0 ? (
            wallet.history.map((tx) => (
              <TransactionItem key={tx.id}>
                <TransIcon>
                  <ArrowUpRight size={18} color={colors.slate[500]} />
                </TransIcon>
                <TransInfo>
                  <TransTitle>{tx.description}</TransTitle>
                  <TransDate>{formatDate(tx.date || tx.createdAt)}</TransDate>
                </TransInfo>
                <TransAmount positive={tx.type === 'earned'}>
                  {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                </TransAmount>
              </TransactionItem>
            ))
          ) : (
            <TransactionItem style={{ borderBottomWidth: 0 }}>
              <TransInfo>
                <TransTitle style={{ textAlign: 'center', color: colors.slate[400] }}>
                  Nenhuma atividade recente
                </TransTitle>
              </TransInfo>
            </TransactionItem>
          )}
        </HistorySection>

      </ScrollView>
    </Container>
  );
}