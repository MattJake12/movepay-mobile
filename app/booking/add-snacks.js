// File: app/booking/add-snacks.js

import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../src/store/useCartStore';
import { useSnacksQuery } from '../../src/hooks/useSnacks';
import { SnackCard } from '../../src/components/cards/SnackCard.js';
import { ArrowRight, ShoppingBag } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// ===== STYLES =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate[50],
  },
  content: {
    flex: 1,
    padding: spacing[6],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.slate[900],
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.slate[500],
    marginTop: spacing[1],
    fontSize: fontSize.sm,
  },
  promoBanner: {
    backgroundColor: colors.orange[50],
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.orange[100],
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    color: colors.orange[800],
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  promoDesc: {
    color: colors.orange[600],
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  grid: {
    gap: spacing[4],
    paddingBottom: 120, // Padding to ensure content isn't hidden behind footer
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing[6],
    paddingBottom: 32, // Extra padding for bottom safe area
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  cartInfo: {
    flex: 1,
  },
  cartLabel: {
    fontSize: 10,
    color: colors.slate[500],
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },
  cartValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.brand[600],
  },
  continueButton: {
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing[6],
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  buttonText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
});

export default function AddSnacksScreen() {
  const router = useRouter();
  const { data: snacks } = useSnacksQuery();
  
  const cartSnacks = useCartStore((state) => state.snacks);
  const addSnack = useCartStore((state) => state.addSnack);
  const removeSnack = useCartStore((state) => state.removeSnack);

  const getQty = (id) => cartSnacks.filter(s => s.id === id).length;
  const snacksTotal = cartSnacks.reduce((acc, s) => acc + (Number(s.price) || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Serviço de Bordo</Text>
          <Text style={styles.subtitle}>Adicione lanches para uma viagem mais confortável.</Text>
        </View>

        <View style={styles.promoBanner}>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>Combo Café + Bolo</Text>
            <Text style={styles.promoDesc}>Desconto de 20% na compra antecipada.</Text>
          </View>
          <ShoppingBag size={24} color={colors.orange[500]} />
        </View>

        <View style={styles.grid}>
          {snacks && snacks.map((snack) => (
            <SnackCard 
              key={snack.id}
              snack={snack}
              quantity={getQty(snack.id)}
              onAdd={() => addSnack(snack)}
              onRemove={() => removeSnack(snack.id)}
              formatPrice={(p) => `${p} Kz`}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.cartInfo}>
          <Text style={styles.cartLabel}>{cartSnacks.length} Itens Adicionados</Text>
          <Text style={styles.cartValue}>+ {isNaN(snacksTotal) ? '0' : snacksTotal} Kz</Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/booking/payment')}>
          <Text style={styles.buttonText}>Continuar</Text>
          <ArrowRight size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}