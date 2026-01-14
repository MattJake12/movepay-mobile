import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useWallet } from '../../src/hooks/useWallet';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

export default function WalletHistory() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const { useHistory } = useWallet();
  const { data, isLoading } = useHistory(filter, 1);

  const renderFilterChip = (label, filterValue) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: 20,
        backgroundColor:
          filter === filterValue ? colors.brand[600] : colors.white,
        borderWidth: 1,
        borderColor:
          filter === filterValue ? colors.brand[600] : colors.slate[200],
        marginRight: spacing[2],
      }}
      onPress={() => setFilter(filterValue)}
    >
      <Text
        style={{
          color: filter === filterValue ? colors.white : colors.slate[600],
          fontWeight: fontWeight.semibold,
          fontSize: fontSize.xs,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }) => {
    const isIncome = item.amount > 0;
    const icon = isIncome ? (
      <ArrowDownLeft size={20} color={colors.emerald[600]} />
    ) : (
      <ArrowUpRight size={20} color={colors.red[600]} />
    );

    const formattedDate = new Date(item.createdAt).toLocaleDateString('pt-AO');
    const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing[6],
          paddingVertical: spacing[4],
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.slate[50],
        }}
      >
        {/* ICON */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isIncome ? colors.emerald[50] : colors.red[50],
            marginRight: spacing[3],
          }}
        >
          {icon}
        </View>

        {/* INFO */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: fontWeight.semibold,
              color: colors.slate[900],
              fontSize: fontSize.sm,
            }}
          >
            {item.description}
          </Text>
          <Text
            style={{
              color: colors.slate[500],
              fontSize: fontSize.xs,
              marginTop: spacing[1],
            }}
          >
            {formattedDate} • {formattedTime}
          </Text>
        </View>

        {/* AMOUNT */}
        <Text
          style={{
            fontWeight: fontWeight.bold,
            fontSize: fontSize.base,
            color: isIncome ? colors.emerald[600] : colors.red[600],
          }}
        >
          {isIncome ? '+' : ''}{item.amount}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.slate[50] }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing[6],
          paddingVertical: spacing[4],
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.slate[100],
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.slate[900]} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            color: colors.slate[900],
            marginLeft: spacing[4],
            flex: 1,
          }}
        >
          Extrato Completo
        </Text>
      </View>

      {/* FILTER BAR */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing[6],
          paddingVertical: spacing[4],
          gap: spacing[2],
        }}
      >
        {renderFilterChip('Todos', 'ALL')}
        {renderFilterChip('Entradas', 'IN')}
        {renderFilterChip('Saídas', 'OUT')}
      </View>

      {/* LIST */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator
            size="large"
            color={colors.brand[600]}
          />
        </View>
      ) : data?.data && data.data.length > 0 ? (
        <FlatList
          data={data.data}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing[6] }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              color: colors.slate[500],
              fontSize: fontSize.base,
              fontWeight: fontWeight.medium,
            }}
          >
            Nenhuma transação encontrada
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
