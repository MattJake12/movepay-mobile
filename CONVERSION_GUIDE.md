// CONVERSION GUIDE: Tailwind className -> Styled-Components
// ========================================================

/**
 * STEP 1: Replace home.js
 * 
 * OLD:
 * <View className="flex-1 bg-slate-50">
 * 
 * NEW:
 * const Container = styled.View`
 *   flex: 1;
 *   background-color: ${colors.slate[50]};
 * `;
 * <Container>
 */

/**
 * STEP 2: Mapping Guide
 * 
 * SPACING:
 * p-4 -> padding: 16px
 * m-6 -> margin: 24px
 * gap-3 -> gap: 12px
 * 
 * COLORS:
 * bg-slate-50 -> ${colors.slate[50]}
 * text-white -> color: ${colors.white}
 * border-brand-600 -> border-color: ${colors.brand[600]}
 * 
 * FLEX:
 * flex-1 -> flex: 1
 * flex-row -> flexDirection: 'row'
 * items-center -> alignItems: 'center'
 * justify-between -> justifyContent: 'space-between'
 * 
 * BORDER:
 * rounded-xl -> borderRadius: 12px
 * border border-slate-100 -> borderWidth: 1px, borderColor: ${colors.slate[100]}
 * 
 * TEXT:
 * font-bold -> fontWeight: 'bold' / fontWeight: '700'
 * text-sm -> fontSize: 14px
 * text-center -> textAlign: 'center'
 * 
 * SHADOW:
 * shadow-lg -> ${shadows.lg}
 */

/**
 * PRIORITY CONVERSION ORDER:
 * 
 * 1. ✅ app/(tabs)/home.js -> home-styled.js (DONE)
 * 2. app/(tabs)/my-trips.js
 * 3. app/(tabs)/wallet.js
 * 4. app/(tabs)/profile.js
 * 5. app/(tabs)/operator.js
 * 6. app/(tabs)/validation.js
 * 7. app/booking/_layout.js
 * 8. app/booking/* (all files)
 * 9. app/(modals)/* (all files)
 * 10. src/components/* (all components)
 * 11. app/(public)/* (login screens)
 * 12. app/support/chat.js
 * 13. app/driver/* (driver screens)
 */

/**
 * IMPORT AT TOP OF FILES:
 * 
 * import styled from 'styled-components/native';
 * import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../src/theme/theme';
 * 
 * OR use pre-made components from src/theme/styled.js:
 * 
 * import { 
 *   Container, Row, Column, Text, H1, H2, Button,
 *   Card, InputField, Badge, Divider, SafeArea
 * } from '../../src/theme/styled';
 */

export const conversionTips = {
  // Transform className props to styled object
  classNameToStyled: {
    'flex-1': 'flex: 1',
    'flex-row': 'flexDirection: row',
    'items-center': 'alignItems: center',
    'justify-center': 'justifyContent: center',
    'justify-between': 'justifyContent: space--between',
    'p-4': `padding: ${16}px`,
    'm-4': `margin: ${16}px`,
    'rounded-xl': `borderRadius: ${12}px`,
    'bg-slate-50': `backgroundColor: ${colors.slate[50]}`,
    'text-white': `color: ${colors.white}`,
    'font-bold': 'fontWeight: bold',
    'text-sm': `fontSize: ${14}px`,
  },
  
  commonPatterns: {
    // Pattern: <View className="flex-1 bg-slate-50">
    // Replace with: <Container>
    container: `
      const Container = styled.View\`
        flex: 1;
        background-color: \${colors.slate[50]};
      \`;
    `,
    
    // Pattern: <View className="flex-row gap-3">
    // Replace with: <Row gap={3}>
    row: `
      import { Row } from '../../src/theme/styled';
      <Row gap={3}>...</Row>
    `,
    
    // Pattern: <Text className="font-bold text-white">
    // Replace with: <H1 color={colors.white}>
    heading: `
      import { H1, H2, Text } from '../../src/theme/styled';
      <H1 color={colors.white}>...</H1>
    `,
  }
};
