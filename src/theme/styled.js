// File: src/theme/styled.js

import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, lineHeight } from './theme';

// ===== WRAPPERS & LAYOUTS =====

export const SafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: ${props => props.bg || colors.slate[50]};
`;

// Container principal com padding padrão lateral (evita conteúdo colado na borda)
export const Container = styled.View`
  flex: 1;
  background-color: ${props => props.bg || colors.slate[50]};
  padding-horizontal: ${props => props.px ? spacing[props.px] : 0}px;
  padding-vertical: ${props => props.py ? spacing[props.py] : 0}px;
`;

export const ScrollContainer = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => spacing[props.gap || 0]}px;
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

export const Column = styled.View`
  flex-direction: column;
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => spacing[props.gap || 0]}px;
`;

export const Spacer = styled.View`
  height: ${props => spacing[props.h || 0]}px;
  width: ${props => spacing[props.w || 0]}px;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${colors.slate[200]};
  margin-vertical: ${spacing[4]}px;
  width: 100%;
`;

// ===== TYPOGRAPHY (Hierarquia clara) =====

export const Text = styled.Text`
  color: ${props => props.color || colors.slate[600]};
  font-size: ${fontSize.base}px;
  line-height: ${lineHeight.base}px;
  font-weight: ${fontWeight.regular};
  text-align: ${props => props.align || 'left'};
`;

// Título de Página (Grande, escuro, sem ser agressivo)
export const H1 = styled(Text)`
  font-size: ${fontSize['3xl']}px;
  line-height: ${lineHeight['3xl']}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  letter-spacing: -0.5px;
`;

// Título de Seção
export const H2 = styled(Text)`
  font-size: ${fontSize.xl}px;
  line-height: ${lineHeight.xl}px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[800]};
  letter-spacing: -0.25px;
`;

// Título de Card
export const H3 = styled(Text)`
  font-size: ${fontSize.lg}px;
  line-height: ${lineHeight.lg}px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[800]};
`;

// Texto pequeno técnico (legendas, datas)
export const Caption = styled(Text)`
  font-size: ${fontSize.xs}px;
  line-height: ${lineHeight.xs}px;
  color: ${colors.slate[400]};
`;

// Labels de formulários ou badges
export const Label = styled(Text)`
  font-size: ${fontSize.xs}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[500]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ===== CARDS & SURFACES =====

// Card Base: Branco, raio moderado, sombra suave
export const Card = styled.View`
  background-color: ${colors.white};
  border-radius: ${borderRadius.lg}px;
  padding: ${props => spacing[props.p || 4]}px;
  margin-bottom: ${props => spacing[props.mb || 3]}px;
  border-width: 1px;
  border-color: ${colors.slate[100]}; 
  ${shadows.sm} 
`;

// Usado para cabeçalhos dentro de Cards
export const CardHeader = styled(Row)`
  justify-content: space-between;
  margin-bottom: ${spacing[3]}px;
  padding-bottom: ${spacing[2]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
`;

// ===== INPUTS =====

// Container do Input para manter Label e Erro juntos
export const InputGroup = styled.View`
  margin-bottom: ${spacing[4]}px;
`;

// Campo de texto estilo "Banking": Fundo claro, borda fina, foco elegante
export const InputField = styled.TextInput.attrs({
  placeholderTextColor: colors.slate[400],
})`
  background-color: ${colors.white};
  border-radius: ${borderRadius.lg}px;
  padding-horizontal: ${spacing[4]}px;
  height: 52px; /* Altura fixa para touch target ideal */
  font-size: ${fontSize.base}px;
  color: ${colors.slate[900]};
  border-width: 1px;
  border-color: ${props => props.error ? colors.red[500] : colors.slate[200]};
  font-weight: ${fontWeight.medium};
`;

// ===== BUTTONS =====

export const Button = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding-horizontal: ${spacing[6]}px;
  border-radius: ${borderRadius.lg}px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  
  /* Variantes */
  background-color: ${props => {
    if (props.variant === 'outline') return 'transparent';
    if (props.variant === 'ghost') return 'transparent';
    if (props.variant === 'danger') return colors.red[50];
    if (props.variant === 'secondary') return colors.slate[100];
    return colors.brand[600]; // Primary default
  }};

  border-width: ${props => (props.variant === 'outline' ? '1px' : '0px')};
  border-color: ${props => (props.variant === 'outline' ? colors.slate[300] : 'transparent')};
  
  /* Sombra apenas no Primary para dar "peso" */
  ${props => (props.variant === 'primary' || !props.variant ? shadows.md : shadows.none)}
`;

export const ButtonText = styled(Text)`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${props => {
    if (props.variant === 'outline') return colors.slate[700];
    if (props.variant === 'ghost') return colors.brand[600];
    if (props.variant === 'danger') return colors.red[600];
    if (props.variant === 'secondary') return colors.slate[900];
    return colors.white; // Primary default
  }};
`;

// ===== BADGES & TAGS =====

export const Badge = styled.View`
  padding-horizontal: ${spacing[2.5]}px;
  padding-vertical: ${spacing[1]}px;
  border-radius: ${borderRadius.full}px;
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  gap: 4px;

  background-color: ${props => {
    switch (props.variant) {
      case 'success': return colors.green[50];
      case 'warning': return colors.yellow[50];
      case 'danger': return colors.red[50];
      case 'info': return colors.blue[50];
      case 'brand': return colors.brand[50];
      default: return colors.slate[100];
    }
  }};
  
  border-width: 1px;
  border-color: ${props => {
    switch (props.variant) {
      case 'success': return colors.green[200];
      case 'warning': return colors.yellow[200];
      case 'danger': return colors.red[200];
      case 'info': return colors.blue[200];
      case 'brand': return colors.brand[200];
      default: return colors.slate[200];
    }
  }};
`;

export const BadgeText = styled(Text)`
  font-size: 11px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  color: ${props => {
    switch (props.variant) {
      case 'success': return colors.green[700];
      case 'warning': return colors.yellow[700];
      case 'danger': return colors.red[700];
      case 'info': return colors.blue[700];
      case 'brand': return colors.brand[700];
      default: return colors.slate[600];
    }
  }};
`;