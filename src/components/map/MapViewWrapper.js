// File: src/components/map/MapViewWrapper.js

import React, { Suspense, lazy } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Carregar MapView dinamicamente para evitar erros de inicialização
let MapView = null;
let MapViewMarker = null;
let MapViewCircle = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  MapViewMarker = maps.Marker;
  MapViewCircle = maps.Circle;
} catch (e) {
  console.warn('⚠️ react-native-maps não está disponível:', e.message);
}

const MapViewFallback = (props) => (
  <View style={[styles.placeholder, props.style]}>
    <Text style={styles.placeholderText}>Mapa indisponível</Text>
    <Text style={styles.placeholderSubtext}>Use dispositivo físico ou rode em web (tracker.web.js)</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

export default MapView || MapViewFallback;
export const Marker = MapViewMarker || View;
export const Circle = MapViewCircle || View;
