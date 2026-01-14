// File: src/components/booking/PaymentMethodSelector.js

import React from 'react';
import styled from 'styled-components/native';
import { Smartphone, CreditCard, Wallet, CheckCircle2 } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View``;

const Title = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  margin-bottom: ${spacing[4]}px;
`;

const MethodButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  padding: ${spacing[4]}px;
  borderRadius: 16px;
  marginBottom: ${spacing[3]}px;
  borderWidth: 1px;
  backgroundColor: ${props => (props.selected ? colors.brand[50] : colors.white)};
  borderColor: ${props => (props.selected ? colors.brand[500] : colors.slate[200])};
  shadowColor: ${props => (props.selected ? colors.slate[900] : 'transparent')};
  shadowOpacity: 0.05;
  shadowRadius: 2;
  shadowOffset: 0 1;
`;

const IconWrapper = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-right: ${spacing[4]}px;
  background-color: ${props => (props.selected ? colors.brand[200] : colors.slate[100])};
`;

const Content = styled.View`
  flex: 1;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const MethodName = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
  color: ${props => (props.selected ? colors.brand[900] : colors.slate[700])};
`;

const RecommendedBadge = styled.View`
  background-color: ${colors.emerald[100]};
  padding-horizontal: ${spacing[2]}px;
  padding-vertical: ${spacing[1]}px;
  border-radius: 6px;
`;

const RecommendedText = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.emerald[700]};
`;

const Description = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  margin-top: ${spacing[1]}px;
`;

const Checkbox = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props => (props.selected ? colors.brand[600] : colors.slate[300])};
  background-color: ${props => (props.selected ? colors.brand[600] : colors.white)};
  align-items: center;
  justify-content: center;
`;

export default function PaymentMethodSelector({ selectedMethod, onSelect }) {
  const methods = [
    {
      id: 'MULTICAIXA_EXPRESS',
      name: 'Multicaixa Express',
      description: 'Débito direto no telemóvel',
      icon: Smartphone, 
      color: colors.blue[600],
      recommended: true
    },
    {
      id: 'UNITEL_MONEY',
      name: 'Unitel Money',
      description: 'Pagamento móvel',
      icon: Wallet,
      color: colors.orange[600],
      recommended: false
    },
    {
      id: 'CREDIT_CARD',
      name: 'Cartão VISA / GPO',
      description: 'Débito ou Crédito Bancário',
      icon: CreditCard,
      color: colors.slate[700],
      recommended: false
    },
  ];

  return (
    <Container>
      <Title>Escolha como pagar</Title>

      {methods.map((method) => {
        const isSelected = selectedMethod === method.id;
        const Icon = method.icon;

        return (
          <MethodButton
            key={method.id}
            onPress={() => onSelect(method.id)}
            activeOpacity={0.8}
            selected={isSelected}
          >
            <IconWrapper selected={isSelected}>
              <Icon 
                size={24} 
                color={isSelected ? colors.brand[600] : method.color} 
              />
            </IconWrapper>

            <Content>
              <Header>
                <MethodName selected={isSelected}>
                  {method.name}
                </MethodName>
                {method.recommended && (
                  <RecommendedBadge>
                    <RecommendedText>RÁPIDO</RecommendedText>
                  </RecommendedBadge>
                )}
              </Header>
              <Description>
                {method.description}
              </Description>
            </Content>

            <Checkbox selected={isSelected}>
              {isSelected && <CheckCircle2 size={16} color={colors.white} />}
            </Checkbox>
          </MethodButton>
        );
      })}
    </Container>
  );
}