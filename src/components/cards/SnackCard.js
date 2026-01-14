// File: src/components/cards/SnackCard.js

import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { Armchair, Store } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// Color values for specific use cases (not in colors export)
const SEAT_DELIVERY_COLOR = '#2563eb'; // info[600]
const PICKUP_DELIVERY_COLOR = '#ca8a04'; // warning[600]

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    gap: spacing[4],
    padding: spacing[3],
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: colors.slate[100],
    borderRadius: 8,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {},
  snackName: {
    color: colors.slate[900],
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  description: {
    color: colors.slate[500],
    fontSize: fontSize.xs,
    marginTop: spacing[1],
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  deliveryTextSeat: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: SEAT_DELIVERY_COLOR,
  },
  deliveryTextPickup: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: PICKUP_DELIVERY_COLOR,
  },
  price: {
    color: colors.brand[600],
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  controls: {
    justifyContent: 'center',
    gap: spacing[2],
    alignItems: 'center',
  },
  controlButtonAdd: {
    width: 32,
    height: 32,
    backgroundColor: colors.brand[500],
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonRemove: {
    width: 32,
    height: 32,
    backgroundColor: colors.slate[100],
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlTextAdd: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  controlTextRemove: {
    color: colors.slate[600],
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  quantityText: {
    textAlign: 'center',
    fontWeight: fontWeight.bold,
    color: colors.slate[900],
    width: 32,
    fontSize: fontSize.sm,
  },
});

export function SnackCard({ snack, quantity, onAdd, onRemove, formatPrice, deliveryMethod }) {
  const isSeatDelivery = deliveryMethod === 'SEAT_DELIVERY';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: snack.imageUrl }} style={styles.image} resizeMode="cover" />

        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.snackName}>{snack.name}</Text>
            <Text style={styles.description}>{snack.description}</Text>
            
            {deliveryMethod && (
              <View style={styles.deliveryBadge}>
                {isSeatDelivery ? (
                  <>
                    <Armchair size={12} color={SEAT_DELIVERY_COLOR} />
                    <Text style={styles.deliveryTextSeat}>Entrega no assento</Text>
                  </>
                ) : (
                  <>
                    <Store size={12} color={PICKUP_DELIVERY_COLOR} />
                    <Text style={styles.deliveryTextPickup}>Retirada balcão</Text>
                  </>
                )}
              </View>
            )}
          </View>
          <Text style={styles.price}>{formatPrice(snack.price)}</Text>
        </View>

        <View style={styles.controls}>
          <Pressable style={styles.controlButtonRemove} onPress={() => onRemove(snack.id)}>
            <Text style={styles.controlTextRemove}>−</Text>
          </Pressable>

          <Text style={styles.quantityText}>{quantity}</Text>

          <Pressable style={styles.controlButtonAdd} onPress={() => onAdd(snack)}>
            <Text style={styles.controlTextAdd}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
