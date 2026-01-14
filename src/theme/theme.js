// File: src/theme/theme.js

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// ==========================================
// 1. DEFINIÇÃO DAS CORES NOVAS (PREMIUM)
// ==========================================

const palette = {
  // O novo Roxo (Brand)
  brand: {
    25: '#fcfbfe',
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  // O novo Cinza (Slate)
  slate: {
    25: '#fbfcff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  // Cores de Sistema
  success: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#10b981', 600: '#059669', 700: '#047857' },
  danger:  { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  warning: { 50: '#fefce8', 100: '#fef9c3', 500: '#eab308', 600: '#ca8a04', 700: '#a16207' },
  info:    { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  orange:  { 50: '#fff7ed', 100: '#fed7aa', 200: '#fdba74', 300: '#fb923c', 400: '#f97316', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412' },
  emerald: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#d1fae5', 300: '#a7f3d0', 500: '#10b981', 600: '#059669', 700: '#047857' },
  amber:   { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 500: '#f59e0b', 700: '#b45309' },
  red:     { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  green:   { 50: '#f0fdf4', 100: '#dcfce7', 200: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857' },
  yellow:  { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 500: '#eab308', 700: '#a16207' },
  blue:    { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// ==========================================
// 2. EXPORTAÇÃO COMPATÍVEL (A MÁGICA)
// ==========================================
// Aqui mapeamos os nomes antigos para as cores novas.
// O app antigo acha que está usando 'gray', mas recebe 'slate'.

export const colors = {
  // As novas
  brand: palette.brand,
  slate: palette.slate,
  orange: palette.orange,
  emerald: palette.emerald,
  amber: palette.amber,
  red: palette.red,
  green: palette.green,
  yellow: palette.yellow,
  blue: palette.blue,
  
  // === ALIAS PARA EVITAR CRASHES (DEFINIÇÕES MISSING) ===
  purple: palette.brand, // Brand é Roxo
  cyan: palette.blue,    // Fallback para Blue
  indigo: palette.brand, // Fallback para Brand (Roxo-azulado)
  // Se o add-snacks.js chama colors.primary...
  primary: palette.brand[600],
  primaryLight: palette.brand[100],
  primaryDark: palette.brand[900],
  
  // Se chama colors.secondary...
  secondary: palette.slate[500],
  secondaryLight: palette.slate[200],
  
  // Se chama colors.background...
  background: palette.slate[25], // Fundo premium
  surface: palette.white,
  card: palette.white,
  
  // Se chama colors.text...
  text: palette.slate[900],
  textPrimary: palette.slate[900],
  textSecondary: palette.slate[500],
  textLight: palette.slate[400],
  placeholder: palette.slate[400],
  
  // Se chama colors.border...
  border: palette.slate[200],
  separator: palette.slate[100],
  
  // Se chama colors.gray (Mapeia o objeto inteiro ou valores fixos)
  gray: {
    ...palette.slate, // 50, 100, 200... funcionam igual
    light: palette.slate[200],
    medium: palette.slate[500],
    dark: palette.slate[800],
  },
  
  // Mapeamentos diretos
  white: palette.white,
  black: palette.black,
  transparent: palette.transparent,
  success: palette.success[500], // Caso use string direta
  danger: palette.danger[500],
  error: palette.danger[500],    // Alias comum
  warning: palette.warning[500],
  info: palette.info[500],
  blue: palette.info[500],
  red: palette.danger[500],
  green: palette.success[500],
  
  // Objetos completos também disponíveis
  successObj: palette.success,
  dangerObj: palette.danger,
  warningObj: palette.warning,
  
  // Gradientes
  gradientStart: palette.brand[600],
  gradientEnd: palette.brand[900],
};

// ==========================================
// 3. TIPOGRAFIA & METRICS
// ==========================================

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  // Compatibilidade
  small: 12,
  medium: 16,
  large: 20,
  title: 24,
};

export const fontWeight = {
  thin: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  // Compatibilidade caso usem spacing.small
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
  // Compatibilidade
  small: 8,
  medium: 12,
  large: 16,
  rounded: 9999,
};

// ==========================================
// 4. SOMBRAS & LAYOUT
// ==========================================

// Usamos objetos para compatibilidade com props style e styled-components
const shadowStyles = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: palette.slate[500],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sm: {
    shadowColor: palette.slate[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: palette.slate[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: palette.brand[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    shadowColor: palette.brand[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Helper para permitir uso em styled-components (como string) e styles normais (como objeto)
const makeShadow = (obj) => {
  const css = `
    shadow-color: ${obj.shadowColor};
    shadow-offset: ${obj.shadowOffset.width}px ${obj.shadowOffset.height}px;
    shadow-opacity: ${obj.shadowOpacity};
    shadow-radius: ${obj.shadowRadius};
    elevation: ${obj.elevation};
  `;
  const result = { ...obj };
  Object.defineProperty(result, 'toString', {
    value: () => css,
    enumerable: false,
    configurable: true
  });
  return result;
};

export const shadows = {
  none: makeShadow(shadowStyles.none),
  xs: makeShadow(shadowStyles.xs),
  sm: makeShadow(shadowStyles.sm),
  md: makeShadow(shadowStyles.md),
  lg: makeShadow(shadowStyles.lg),
  glow: makeShadow(shadowStyles.glow),
};

export const layout = {
  window: { width, height },
  width,
  height,
  isSmallDevice: width < 375,
  headerHeight: 60,
  tabBarHeight: 80,
};

export const letterSpacing = {
  normal: 0,
  wide: 0.4,
  wider: 0.8,
};

// ==========================================
// 5. EXPORTAÇÃO DEFAULT (SEGURANÇA TOTAL)
// ==========================================

const theme = {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
  layout,
  letterSpacing,
  // Alias extra se alguém importar 'sizes'
  sizes: { ...spacing, ...fontSize, width, height, borderRadius: borderRadius.md },
  // Alias extra se alguém importar 'fonts'
  fonts: { size: fontSize, weight: fontWeight },
};

export default theme;