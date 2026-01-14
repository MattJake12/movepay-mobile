// File: src/components/ui/Button.js

import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  height: ${props => {
    if (props.size === 'sm') return 36;
    if (props.size === 'lg') return 56;
    return 48;
  }}px;
  padding-horizontal: ${props => {
    if (props.size === 'sm') return 12;
    if (props.size === 'lg') return 24;
    return 16;
  }}px;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  background-color: ${props => {
    switch (props.variant) {
      case 'outline':
        return colors.white;
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.red[50];
      case 'primary':
      default:
        return colors.brand[600];
    }
  }};
  borderWidth: ${props => (props.variant === 'outline' ? 1 : 0)};
  borderColor: ${colors.slate[200]};
  shadowColor: ${props => (props.variant === 'primary' ? colors.brand[500] : 'transparent')};
  shadowOpacity: 0.3;
  shadowRadius: 8;
  shadowOffset: 0 4;
`;

const ButtonText = styled.Text`
  color: ${props => {
    switch (props.variant) {
      case 'primary':
        return colors.white;
      case 'outline':
        return colors.slate[700];
      case 'ghost':
        return colors.brand[600];
      case 'danger':
        return colors.red[600];
      default:
        return colors.white;
    }
  }};
  font-weight: ${props => (props.variant === 'outline' ? fontWeight.semibold : fontWeight.bold)};
  font-size: ${fontSize.base}px;
  margin-left: ${spacing[2]}px;
`;

export function Button({ 
  children, 
  onPress, 
  variant = 'primary',
  size = 'default',
  isLoading = false, 
  disabled = false,
  icon: Icon,
  ...props 
}) {
  const isDisabled = disabled || isLoading;

  return (
    <Container
      onPress={onPress}
      disabled={isDisabled}
      variant={variant}
      size={size}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.white : colors.brand[600]} 
          size="small"
        />
      ) : (
        <>
          {Icon && <Icon size={20} color={variant === 'primary' ? colors.white : colors.slate[600]} />}
          <ButtonText variant={variant}>{children}</ButtonText>
        </>
      )}
    </Container>
  );
}