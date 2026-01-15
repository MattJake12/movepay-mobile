// File: src/components/shared/OfflineIndicator.jsx

import React from 'react';
import { View, Text, Animated } from 'react-native';
import styled from 'styled-components/native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Wifi, WifiOff, Cloud } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  padding-horizontal: ${spacing[4]}px;
  padding-vertical: ${spacing[2]}px;
  border-bottom-width: 1px;
  background-color: ${props => props.bgColor};
  border-bottom-color: ${props => props.borderColor};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ContentRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
  flex: 1;
`;

const IconContainer = styled.View`
  margin-right: ${spacing[2]}px;
`;

const StatusText = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.medium};
  color: ${props => props.color};
`;

const PendingBadge = styled.View`
  background-color: ${colors.warning[100]};
  padding-horizontal: ${spacing[2]}px;
  padding-vertical: ${spacing[1]}px;
  border-radius: 4px;
`;

const PendingText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.warning[800]};
`;

const HintText = styled.Text`
  font-size: 10px;
  color: ${colors.danger[600]};
  margin-top: ${spacing[1]}px;
`;

const AnimatedCloud = styled(Animated.View)``;

export function OfflineIndicator() {
  const { isOnline, networkType } = useNetworkStatus();
  const { queueSize, isSyncing } = useOfflineQueue();

  // Animação para o ícone de nuvem quando sincronizando
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isSyncing, bounceAnim]);

  if (isOnline && queueSize === 0) {
    return null; // Não mostrar quando tudo está ok
  }

  const isOffline = !isOnline;
  const hasPendingSync = queueSize > 0;

  let bgColor, borderColor;
  if (isOffline) {
    bgColor = colors.danger[50];
    borderColor = colors.danger[200];
  } else if (hasPendingSync) {
    bgColor = colors.warning[50];
    borderColor = colors.warning[200];
  } else {
    bgColor = colors.success[50];
    borderColor = colors.success[200];
  }

  return (
    <Container bgColor={bgColor} borderColor={borderColor}>
      <Row>
        <ContentRow>
          {isOffline ? (
            <>
              <IconContainer>
                <WifiOff size={16} color={colors.danger[600]} />
              </IconContainer>
              <StatusText color={colors.danger[700]}>
                Sem conexão
              </StatusText>
            </>
          ) : hasPendingSync ? (
            <>
              <AnimatedCloud style={{ transform: [{ translateY: bounceAnim }] }}>
                <Cloud size={16} color={isSyncing ? colors.warning[500] : colors.success[500]} />
              </AnimatedCloud>
              <StatusText color={colors.warning[700]}>
                {isSyncing
                  ? 'Sincronizando...'
                  : `${queueSize} pendente${queueSize > 1 ? 's' : ''}`}
              </StatusText>
            </>
          ) : (
            <>
              <IconContainer>
                <Wifi size={16} color={colors.success[500]} />
              </IconContainer>
              <StatusText color={colors.success[700]}>
                Online • {networkType}
              </StatusText>
            </>
          )}
        </ContentRow>

        {hasPendingSync && !isSyncing && (
          <PendingBadge>
            <PendingText>
              PENDENTE
            </PendingText>
          </PendingBadge>
        )}
      </Row>

      {/* Dica */}
      {isOffline && (
        <HintText>
          As suas ações serão sincronizadas quando a conexão voltar
        </HintText>
      )}
    </Container>
  );
}
