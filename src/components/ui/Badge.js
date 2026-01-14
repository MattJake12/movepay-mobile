// File: src/components/ui/Badge.js

import React from 'react';
import styled from 'styled-components/native';
import { colors, fontSize, fontWeight, spacing } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const BadgeContainer = styled.View`
  padding-horizontal: ${spacing[2]}px;
  padding-vertical: ${spacing[1]}px;
  border-radius: 6px;
  border-width: 1px;
  border-color: ${props => {
    switch (props.variant) {
      case 'success':
        return colors.emerald[200];
      case 'warning':
        return colors.orange[200];
      case 'danger':
        return colors.red[200];
      case 'brand':
        return colors.brand[100];
      case 'default':
      default:
        return colors.slate[200];
    }
  }};
  background-color: ${props => {
    switch (props.variant) {
      case 'success':
        return colors.emerald[100];
      case 'warning':
        return colors.orange[100];
      case 'danger':
        return colors.red[100];
      case 'brand':
        return colors.brand[50];
      case 'default':
      default:
        return colors.slate[100];
    }
  }};
  align-self: flex-start;
`;

const BadgeText = styled.Text`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => {
    switch (props.variant) {
      case 'success':
        return colors.emerald[700];
      case 'warning':
        return colors.orange[700];
      case 'danger':
        return colors.red[700];
      case 'brand':
        return colors.brand[700];
      case 'default':
      default:
        return colors.slate[600];
    }
  }};
`;

export function Badge({ children, variant = 'default' }) {
  return (
    <BadgeContainer variant={variant}>
      <BadgeText variant={variant}>{children}</BadgeText>
    </BadgeContainer>
  );
}