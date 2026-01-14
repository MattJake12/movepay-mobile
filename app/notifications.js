/**
 * 🔔 Notifications Screen
 * ✅ MISSÃO 4: Central de notificações com lista completa
 * 
 * Features:
 * - Lista paginada de notificações
 * - Pull to refresh
 * - Marcar como lida individual ou em massa
 * - Ícones dinâmicos por tipo
 * - Empty state elegante
 */

import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCheck,
  Bell,
  AlertTriangle,
  Tag,
  Info,
  Clock
} from 'lucide-react-native';
import { useNotifications } from '../src/hooks/useNotifications';
import { colors, spacing, fontSize, fontWeight } from '../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing[4]}px ${spacing[6]}px;
  background-color: ${colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.slate[900]};
  flex: 1;
  text-align: center;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${colors.slate[50]};
`;

const ReadAllButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: ${colors.slate[50]};
  border-radius: 8px;
`;

const ReadAllText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: ${colors.brand[600]};
`;

const NotificationItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: ${spacing[4]}px;
  background-color: ${props => props.read ? colors.slate[50] : colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
  ${props => !props.read && `border-left-width: 4px; border-left-color: ${colors.brand[500]};`}
`;

const IconBox = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.bg};
  align-items: center;
  justify-content: center;
  margin-right: ${spacing[3]}px;
`;

const ContentBox = styled.View`
  flex: 1;
`;

const NotifHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const NotifTitle = styled.Text`
  font-size: 14px;
  font-weight: ${props => props.read ? '500' : '700'};
  color: ${props => props.read ? colors.slate[600] : colors.slate[900]};
  flex: 1;
`;

const TimeText = styled.Text`
  font-size: 11px;
  color: ${colors.slate[400]};
  margin-left: 8px;
`;

const NotifBody = styled.Text`
  font-size: 13px;
  color: ${colors.slate[500]};
  line-height: 18px;
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${spacing[8]}px;
`;

const EmptyText = styled.Text`
  font-size: 15px;
  color: ${colors.slate[400]};
  font-weight: 500;
  margin-top: ${spacing[4]}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// ===== HELPERS =====

const getNotificationStyle = (type) => {
  const styles = {
    promo: { icon: Tag, color: colors.purple[500], bg: colors.purple[50] },
    alert: { icon: AlertTriangle, color: colors.red[500], bg: colors.red[50] },
    trip: { icon: Clock, color: colors.blue[500], bg: colors.blue[50] },
    reward: { icon: Tag, color: colors.green[500], bg: colors.green[50] },
    system: { icon: Info, color: colors.slate[500], bg: colors.slate[100] }
  };
  return styles[type] || styles.system;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return date.toLocaleDateString('pt-AO');
};

// ===== COMPONENT =====

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, isLoading, refetch, markAllAsRead } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePress = (notif) => {
    // Lógica de navegação baseada no tipo
    if (notif.data?.tripId) {
      router.push({
        pathname: '/(tabs)/bookings/[id]',
        params: { id: notif.data.tripId }
      });
    }
  };

  const renderItem = ({ item }) => {
    const style = getNotificationStyle(item.type || 'system');
    const Icon = style.icon;
    const timeAgo = formatTime(item.createdAt);

    return (
      <NotificationItem
        read={item.read}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <IconBox bg={style.bg}>
          <Icon size={20} color={style.color} />
        </IconBox>

        <ContentBox>
          <NotifHeader>
            <NotifTitle read={item.read} numberOfLines={1}>
              {item.title}
            </NotifTitle>
            <TimeText>{timeAgo}</TimeText>
          </NotifHeader>
          <NotifBody numberOfLines={2}>
            {item.message || item.body}
          </NotifBody>
        </ContentBox>
      </NotificationItem>
    );
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Header>
        <BackButton onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.slate[900]} />
        </BackButton>
        <HeaderTitle>Notificações</HeaderTitle>
        <ReadAllButton onPress={() => markAllAsRead()}>
          <CheckCheck size={16} color={colors.brand[600]} />
          <ReadAllText>Ler todas</ReadAllText>
        </ReadAllButton>
      </Header>

      {/* Content */}
      {isLoading && !refreshing ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color={colors.brand[600]} />
        </LoadingContainer>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand[600]}
            />
          }
          ListEmptyComponent={
            <EmptyState>
              <Bell size={48} color={colors.slate[200]} />
              <EmptyText>Sem notificações</EmptyText>
            </EmptyState>
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </Container>
  );
}
