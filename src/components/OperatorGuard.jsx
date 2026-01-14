// File: src/components/OperatorGuard.jsx

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldX, ArrowLeft } from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import { colors, fontSize, fontWeight, spacing } from '../theme/theme';

/**
 * 🛡️ OPERATOR GUARD
 * 
 * Componente de proteção que verifica se o usuário é OPERATOR_STAFF
 * antes de renderizar o conteúdo protegido.
 * 
 * Uso:
 * <OperatorGuard>
 *   <ScreenContent />
 * </OperatorGuard>
 */
export function OperatorGuard({ children }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userRole = user?.role || 'CUSTOMER';

  // Verifica se é operador
  const isOperator = userRole === 'OPERATOR_STAFF';

  // Se não for operador, mostra tela de acesso negado
  if (!isOperator) {
    return (
      <View style={styles.container}>
        <ShieldX size={64} color={colors.red[500]} />
        <Text style={styles.title}>Acesso Restrito</Text>
        <Text style={styles.message}>
          Esta área é exclusiva para operadores de transporte.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <ArrowLeft size={20} color={colors.white} />
          <Text style={styles.buttonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Se for operador, renderiza o conteúdo
  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.slate[900],
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  message: {
    fontSize: fontSize.base,
    color: colors.slate[500],
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand[600],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 12,
    gap: spacing[2],
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});

export default OperatorGuard;
