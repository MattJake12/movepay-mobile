import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Hammer } from 'lucide-react-native';
import { OperatorGuard } from '../../src/components/OperatorGuard';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: ${colors.white};
  border-bottom-width: 1px;
  border-color: ${colors.slate[200]};
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
  margin-right: 12px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.slate[900]};
`;

const Content = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const InfoText = styled.Text`
  font-size: 16px;
  color: ${colors.slate[600]};
  text-align: center;
  margin-top: 16px;
  line-height: 24px;
`;

const Badge = styled.View`
  background-color: ${colors.orange[100]};
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 24px;
`;

const BadgeText = styled.Text`
  color: ${colors.orange[700]};
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
`;

export default function SalesScreen() {
  const router = useRouter();

  return (
    <OperatorGuard>
    <Container>
      <Header>
        <BackButton onPress={() => router.back()}>
          <ArrowLeft color={colors.slate[900]} size={24} />
        </BackButton>
        <Title>Venda de Bilhetes</Title>
      </Header>

      <Content>
        <Badge>
          <BadgeText>Em Desenvolvimento</BadgeText>
        </Badge>
        
        <Hammer size={64} color={colors.slate[300]} />
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 24, color: colors.slate[800] }}>
          Módulo POS Mobile
        </Text>
        
        <InfoText>
          A funcionalidade de venda direta pelo motorista estará disponível na próxima atualização do sistema.
          {'\n\n'}
          Por enquanto, utilize o terminal web ou os guichês de vendas.
        </InfoText>
      </Content>
    </Container>
    </OperatorGuard>
  );
}
