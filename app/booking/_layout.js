// File: app/booking/_layout.js

import { Stack, useRouter, useSegments } from 'expo-router';
import { View, TouchableOpacity, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

export default function BookingLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  // Lógica da Barra de Progresso
  const currentRoute = segments[segments.length - 1];
  
  let step = 1;
  let title = "Detalhes";
  let showHeader = true; // Mostrar header por padrão
  
  if (currentRoute === 'search-results') { showHeader = false; } // Search não tem header/progresso
  if (currentRoute === '[id]') { step = 1; title = "Detalhes da Viagem"; }
  if (currentRoute === 'select-seats') { step = 2; title = "Escolha de Assentos"; }
  if (currentRoute === 'add-snacks') { step = 3; title = "Serviço de Bordo"; }
  if (currentRoute === 'payment') { step = 4; title = "Pagamento"; }
  if (currentRoute === 'confirmation') { step = 5; title = "Concluído"; }

  const progressPercentage = (step / 4) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.slate[50] }}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER PERSONALIZADO (Só aparece se showHeader for true) */}
      {showHeader && step < 5 && (
        <SafeAreaView style={{ backgroundColor: colors.white, zIndex: 10 }}>
          <View style={{ paddingHorizontal: spacing[6], paddingTop: spacing[2], paddingBottom: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.slate[100] }}>
            
            {/* Top Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{ width: 40, height: 40, backgroundColor: colors.slate[50], borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
              >
                {step === 1 ? (
                  <X size={20} color={colors.slate[400]} />
                ) : (
                  <ArrowLeft size={20} color={colors.slate[400]} />
                )}
              </TouchableOpacity>
              
              <Text style={{ fontWeight: fontWeight.bold, color: colors.slate[900], fontSize: fontSize.base }}>
                {title}
              </Text>
              
              <View style={{ width: 40 }} />
            </View>

            {/* Progress Bar */}
            <View style={{ height: 6, backgroundColor: colors.slate[100], borderRadius: 3, overflow: 'hidden', flexDirection: 'row' }}>
              <View style={{ height: '100%', backgroundColor: colors.brand[600], borderRadius: 3, width: Math.min(progressPercentage, 100) + '%' }} />
            </View>
            <Text style={{ fontSize: 10, color: colors.slate[400], fontWeight: fontWeight.bold, textAlign: 'right', marginTop: spacing[1] }}>
              PASSO {step} DE 4
            </Text>
          </View>
        </SafeAreaView>
      )}

      {/* CONTEÚDO */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      </View>
    </View>
  );
}