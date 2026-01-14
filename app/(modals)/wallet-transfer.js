import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, User, ArrowRight } from 'lucide-react-native';
import { useWallet } from '../../src/hooks/useWallet';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

export default function WalletTransfer() {
  const router = useRouter();
  const { transfer, wallet } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [points, setPoints] = useState('');

  const handleTransfer = async () => {
    if (!recipient || !points) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const pointsNum = parseInt(points);
    if (pointsNum <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    if (wallet && pointsNum > wallet.balance) {
      Alert.alert('Erro', 'Saldo insuficiente');
      return;
    }

    Alert.alert(
      'Confirmar Transferência',
      `Enviar ${pointsNum} pontos para ${recipient}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            transfer.mutate(
              { identifier: recipient, amount: pointsNum },
              {
                onSuccess: (result) => {
                  Alert.alert(
                    'Sucesso!',
                    `${pointsNum} pontos enviados para ${result.data.recipient}`,
                    [
                      {
                        text: 'OK',
                        onPress: () => router.back(),
                      },
                    ]
                  );
                },
                onError: (err) => {
                  const message =
                    err.response?.data?.message ||
                    'Falha na transferência';
                  Alert.alert('Erro', message);
                },
              }
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ flex: 1, padding: spacing[6] }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[10],
          }}
        >
          <Text
            style={{
              fontSize: fontSize['2xl'],
              fontWeight: fontWeight.bold,
              color: colors.slate[900],
            }}
          >
            Enviar Pontos
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={colors.slate[400]} />
          </TouchableOpacity>
        </View>

        {/* RECIPIENT INPUT */}
        <View style={{ marginBottom: spacing[6] }}>
          <Text
            style={{
              fontSize: fontSize.xs,
              fontWeight: fontWeight.bold,
              color: colors.slate[500],
              textTransform: 'uppercase',
              marginBottom: spacing[3],
              letterSpacing: 1,
            }}
          >
            Destinatário (Telefone ou Email)
          </Text>
          <TextInput
            placeholder="Ex: 923... ou edson@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={recipient}
            onChangeText={setRecipient}
            style={{
              backgroundColor: colors.slate[50],
              padding: spacing[4],
              borderRadius: 12,
              fontSize: fontSize.base,
              color: colors.slate[900],
              borderWidth: 1,
              borderColor: colors.slate[200],
            }}
          />
        </View>

        {/* POINTS INPUT */}
        <View style={{ marginBottom: spacing[8] }}>
          <Text
            style={{
              fontSize: fontSize.xs,
              fontWeight: fontWeight.bold,
              color: colors.slate[500],
              textTransform: 'uppercase',
              marginBottom: spacing[3],
              letterSpacing: 1,
            }}
          >
            Quantidade de Pontos
          </Text>
          <TextInput
            placeholder="0"
            keyboardType="numeric"
            value={points}
            onChangeText={setPoints}
            style={{
              backgroundColor: colors.slate[50],
              padding: spacing[4],
              borderRadius: 12,
              fontSize: fontSize.base,
              color: colors.slate[900],
              borderWidth: 1,
              borderColor: colors.slate[200],
            }}
          />
          <Text
            style={{
              textAlign: 'right',
              color: colors.brand[600],
              fontWeight: fontWeight.bold,
              marginTop: spacing[2],
              fontSize: fontSize.sm,
            }}
          >
            Disponível: {wallet?.balance || 0} pts
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.slate[900],
            padding: spacing[5],
            borderRadius: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing[2],
            marginTop: 'auto',
          }}
          onPress={handleTransfer}
          disabled={transfer.isPending}
        >
          {transfer.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text
                style={{
                  color: colors.white,
                  fontWeight: fontWeight.bold,
                  fontSize: fontSize.base,
                }}
              >
                Confirmar Envio
              </Text>
              <ArrowRight size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
