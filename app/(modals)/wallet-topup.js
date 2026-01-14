import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Smartphone, CreditCard, CheckCircle2, Wallet } from 'lucide-react-native';
import { useWallet } from '../../src/hooks/useWallet';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

export default function WalletTopUp() {
  const router = useRouter();
  const { topUp } = useWallet();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('MULTICAIXA');
  const [phone, setPhone] = useState('');

  const handleTopUp = async () => {
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Erro', 'Mínimo de 100 Kz');
      return;
    }

    if ((method === 'MULTICAIXA' || method === 'UNITEL_MONEY') && phone.length < 9) {
      Alert.alert('Erro', 'Insira um número de telefone válido.');
      return;
    }

    topUp.mutate(
      { amount: parseInt(amount), method, phone },
      {
        onSuccess: (result) => {
          Alert.alert(
            'Sucesso!',
            `${result.data.pointsAdded} pontos adicionados à sua carteira`,
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
            err.response?.data?.message || 'Falha ao carregar a carteira';
          Alert.alert('Erro', message);
        },
      }
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
            Carregar Carteira
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={colors.slate[400]} />
          </TouchableOpacity>
        </View>

        {/* AMOUNT INPUT */}
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
          Valor a Carregar (Kz)
        </Text>

        <TextInput
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          autoFocus
          style={{
            fontSize: 48,
            fontWeight: fontWeight.bold,
            color: colors.brand[600],
            marginBottom: spacing[8],
            borderBottomWidth: 2,
            borderBottomColor: colors.brand[200],
            paddingBottom: spacing[4],
          }}
        />

        {/* ATALHOS RAPIDOS (QUICK AMOUNTS) */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing[8] }}>
            {[1000, 2000, 5000, 10000].map((val) => (
                <TouchableOpacity 
                    key={val}
                    onPress={() => setAmount(String(val))}
                    style={{
                        backgroundColor: amount === String(val) ? colors.brand[600] : colors.slate[100],
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: amount === String(val) ? colors.brand[600] : colors.slate[200]
                    }}
                >
                    <Text style={{ 
                      fontWeight: 'bold', 
                      color: amount === String(val) ? colors.white : colors.slate[600],
                      fontSize: 12
                    }}>
                        {val.toLocaleString()} Kz
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* MÉTODO DE PAGAMENTO */}
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
          Método de Pagamento
        </Text>

        {/* MULTICAIXA */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[4],
            borderRadius: 16,
            borderWidth: 2,
            borderColor:
              method === 'MULTICAIXA' ? colors.brand[600] : colors.slate[200],
            backgroundColor:
              method === 'MULTICAIXA' ? colors.brand[50] : colors.white,
            marginBottom: spacing[3],
          }}
          onPress={() => setMethod('MULTICAIXA')}
        >
          <Smartphone size={24} color={colors.blue[600]} />
          <Text
            style={{
              fontWeight: fontWeight.bold,
              fontSize: fontSize.base,
              marginLeft: spacing[3],
              flex: 1,
              color: colors.slate[800],
            }}
          >
            Multicaixa Express
          </Text>
          {method === 'MULTICAIXA' && (
            <CheckCircle2 size={20} color={colors.brand[600]} />
          )}
        </TouchableOpacity>

        {/* UNITEL MONEY */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[4],
            borderRadius: 16,
            borderWidth: 2,
            borderColor:
              method === 'UNITEL_MONEY' ? colors.brand[600] : colors.slate[200],
            backgroundColor:
              method === 'UNITEL_MONEY' ? colors.brand[50] : colors.white,
            marginBottom: spacing[3],
          }}
          onPress={() => setMethod('UNITEL_MONEY')}
        >
          <Wallet size={24} color={colors.orange[600]} />
          <Text
            style={{
              fontWeight: fontWeight.bold,
              fontSize: fontSize.base,
              marginLeft: spacing[3],
              flex: 1,
              color: colors.slate[800],
            }}
          >
            Unitel Money
          </Text>
          {method === 'UNITEL_MONEY' && (
            <CheckCircle2 size={20} color={colors.brand[600]} />
          )}
        </TouchableOpacity>

        {/* CARD */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[4],
            borderRadius: 16,
            borderWidth: 2,
            borderColor: method === 'CARD' ? colors.brand[600] : colors.slate[200],
            backgroundColor: method === 'CARD' ? colors.brand[50] : colors.white,
            marginBottom: spacing[8],
          }}
          onPress={() => setMethod('CARD')}
        >
          <CreditCard size={24} color={colors.slate[600]} />
          <Text
            style={{
              fontWeight: fontWeight.bold,
              fontSize: fontSize.base,
              marginLeft: spacing[3],
              flex: 1,
              color: colors.slate[800],
            }}
          >
            Cartão VISA / GPO
          </Text>
          {method === 'CARD' && (
            <CheckCircle2 size={20} color={colors.brand[600]} />
          )}
        </TouchableOpacity>

        {/* PHONE INPUT (DYNAMIC) */}
        {(method === 'MULTICAIXA' || method === 'UNITEL_MONEY') && (
          <View style={{ marginBottom: spacing[6] }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.bold,
                color: colors.slate[500],
                textTransform: 'uppercase',
                marginBottom: spacing[2],
                letterSpacing: 1,
              }}
            >
              Telefone associado ao {method === 'MULTICAIXA' ? 'Express' : 'Unitel Money'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.slate[50],
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.slate[200],
                paddingHorizontal: spacing[4],
                height: 56,
              }}
            >
              <Text style={{ fontSize: fontSize.base, fontWeight: 'bold', color: colors.slate[400], marginRight: 10 }}>+244</Text>
              <TextInput
                placeholder="923 000 000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={9}
                style={{
                  flex: 1,
                  fontSize: fontSize.base,
                  fontWeight: 'bold',
                  color: colors.slate[900],
                }}
              />
            </View>
          </View>
        )}

        {/* BUTTON */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.brand[600],
            padding: spacing[5],
            borderRadius: 16,
            alignItems: 'center',
            marginTop: 'auto',
          }}
          onPress={handleTopUp}
          disabled={topUp.isPending}
        >
          {topUp.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                color: colors.white,
                fontWeight: fontWeight.bold,
                fontSize: fontSize.base,
              }}
            >
              Confirmar Pagamento
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
