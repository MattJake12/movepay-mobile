// File: src/components/booking/SnackItem.js

import React from 'react';
import styled from 'styled-components/native';
import { Plus, Minus } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

const formatKz = (v) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  flexDirection: row;
  backgroundColor: ${colors.white};
  padding: ${spacing[3]}px;
  borderRadius: 16px;
  borderWidth: 1px;
  borderColor: ${colors.slate[100]};
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.05;
  shadowRadius: 2;
  shadowOffset: 0 1;
  marginBottom: ${spacing[3]}px;
`;

const Image = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background-color: ${colors.slate[100]};
`;

const ContentWrapper = styled.View`
  flex: 1;
  margin-left: ${spacing[3]}px;
  justify-content: space-between;
  padding-vertical: ${spacing[1]}px;
`;

const Header = styled.View``;

const SnackName = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const Description = styled.Text`
  color: ${colors.slate[500]};
  font-size: ${fontSize.xs}px;
  margin-top: ${spacing[1]}px;
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: ${spacing[2]}px;
`;

const Price = styled.Text`
  color: ${colors.brand[600]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const Stepper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.slate[50]};
  border-radius: 8px;
  padding: ${spacing[1]}px;
  border-width: 1px;
  border-color: ${colors.slate[200]};
`;

const StepperButton = styled.Pressable`
  width: 28px;
  height: 28px;
  backgroundColor: ${props => (props.add ? colors.brand[600] : colors.white)};
  borderRadius: 6px;
  alignItems: center;
  justifyContent: center;
  shadowColor: ${colors.slate[900]};
  shadowOpacity: 0.1;
  shadowRadius: 2;
  shadowOffset: 0 1;
`;

const QuantityText = styled.Text`
  margin-horizontal: ${spacing[3]}px;
  font-weight: ${fontWeight.bold};
  color: ${props => (props.active ? colors.slate[900] : colors.slate[400])};
`;

export function SnackItem({ snack, quantity = 0, onAdd, onRemove }) {
  return (
    <Container>
      <Image 
        source={{ uri: snack.imageUrl || 'https://via.placeholder.com/100' }} 
        resizeMode="cover"
      />

      <ContentWrapper>
        <Header>
          <SnackName>{snack.name}</SnackName>
          <Description numberOfLines={2}>{snack.description}</Description>
        </Header>
        
        <Footer>
          <Price>{formatKz(snack.price)}</Price>
          
          <Stepper>
            {quantity > 0 && (
              <StepperButton onPress={() => onRemove(snack.id)}>
                <Minus size={14} color={colors.red[500]} />
              </StepperButton>
            )}

            <QuantityText active={quantity > 0}>
              {quantity}
            </QuantityText>

            <StepperButton add onPress={() => onAdd(snack)}>
              <Plus size={14} color={colors.white} />
            </StepperButton>
          </Stepper>
        </Footer>
      </ContentWrapper>
    </Container>
  );
}