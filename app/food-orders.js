import React, { useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Image,
  Text,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import {
  ArrowLeft,
  Utensils,
  Clock,
  MapPin,
  ChefHat,
  CheckCircle2,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  Dot
} from 'lucide-react-native';
import { useFoodOrders } from '../src/hooks/useFoodOrders';
import { colors, spacing, fontSize, fontWeight, shadows, borderRadius } from '../src/theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  padding: ${spacing[4]}px ${spacing[6]}px;
  background-color: ${colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
  flex-direction: row;
  align-items: center;
  gap: ${spacing[4]}px;
`;

const HeaderTitle = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  flex: 1;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.slate[50]};
  align-items: center;
  justify-content: center;
`;

const RefreshButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.slate[50]};
  align-items: center;
  justify-content: center;
`;

// TABS
const TabContainer = styled.View`
  flex-direction: row;
  padding: ${spacing[4]}px ${spacing[4]}px;
  gap: ${spacing[3]}px;
  background-color: ${colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  padding: ${spacing[3]}px ${spacing[4]}px;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.active ? colors.brand[600] : colors.slate[100]};
`;

const TabText = styled.Text`
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.sm}px;
  color: ${props => props.active ? colors.white : colors.slate[600]};
`;

const TabBadge = styled.View`
  background-color: ${props => props.active ? 'rgba(255,255,255,0.4)' : colors.brand[100]};
  padding-horizontal: ${spacing[2]}px;
  padding-vertical: 2px;
  border-radius: 10px;
  margin-left: ${spacing[2]}px;
`;

const BadgeText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  color: ${props => props.active ? colors.white : colors.brand[700]};
`;

// CARD DE PEDIDO
const OrderCard = styled.View.attrs({
  style: shadows.md
})`
  background-color: ${colors.white};
  margin-horizontal: ${spacing[4]}px;
  margin-bottom: ${spacing[4]}px;
  border-radius: ${borderRadius.xl}px;
  padding: ${spacing[4]}px;
  border-width: 1px;
  border-color: ${colors.slate[100]};
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing[3]}px;
`;

const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
  flex: 1;
`;

const RestaurantName = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[900]};
`;

const OrderDate = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
`;

const CardContent = styled.View`
  flex-direction: row;
  gap: ${spacing[3]}px;
  margin-bottom: ${spacing[3]}px;
`;

const SnackImage = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: ${borderRadius.lg}px;
  background-color: ${colors.slate[100]};
`;

const InfoCol = styled.View`
  flex: 1;
  justify-content: center;
`;

const SnackName = styled.Text`
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.base}px;
  color: ${colors.slate[800]};
  margin-bottom: ${spacing[1]}px;
`;

const Price = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.lg}px;
  color: ${colors.brand[600]};
  margin-bottom: ${spacing[2]}px;
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[1]}px;
`;

const LocationText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${colors.slate[100]};
  margin-vertical: ${spacing[3]}px;
`;

// STATUS SECTION
const StatusSection = styled.View`
  gap: ${spacing[2]}px;
`;

const StatusRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[2]}px;
`;

const StatusLabel = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
  color: ${props => props.color || colors.slate[600]};
`;

const ProgressBar = styled.View`
  height: 4px;
  background-color: ${colors.slate[100]};
  border-radius: 2px;
  overflow: hidden;
  flex-direction: row;
  gap: 2px;
  margin-top: ${spacing[2]}px;
`;

const ProgressSegment = styled.View`
  flex: 1;
  background-color: ${props => props.active ? props.color : 'transparent'};
`;

const NotificationBadge = styled.View`
  background-color: ${colors.emerald[50]};
  border-left-width: 4px;
  border-left-color: ${colors.emerald[500]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing[3]}px;
  margin-top: ${spacing[2]}px;
`;

const NotificationText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.emerald[800]};
  font-weight: ${fontWeight.semibold};
`;

// EMPTY STATE
const EmptyContainer = styled.View`
  align-items: center;
  justify-content: center;
  margin-top: ${spacing[12]}px;
  opacity: 0.6;
`;

const EmptyText = styled.Text`
  font-size: ${fontSize.base}px;
  color: ${colors.slate[600]};
  margin-top: ${spacing[4]}px;
`;

const ErrorContainer = styled.View`
  flex-direction: row;
  gap: ${spacing[3]}px;
  background-color: ${colors.red[50]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing[4]}px;
  margin: ${spacing[4]}px;
  border-left-width: 4px;
  border-left-color: ${colors.red[500]};
`;

const ErrorText = styled.Text`
  flex: 1;
  font-size: ${fontSize.sm}px;
  color: ${colors.red[800]};
  font-weight: ${fontWeight.semibold};
`;

// ===== HELPER FUNCTIONS =====
const getStatusConfig = (status) => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Aguardando',
        icon: Clock,
        color: colors.orange[500],
        step: 1,
        bgColor: colors.orange[50]
      };
    case 'PREPARING':
      return {
        label: 'Na Cozinha',
        icon: ChefHat,
        color: colors.blue[500],
        step: 2,
        bgColor: colors.blue[50]
      };
    case 'READY':
      return {
        label: 'Pronto p/ Retirar',
        icon: CheckCircle2,
        color: colors.emerald[500],
        step: 3,
        bgColor: colors.emerald[50]
      };
    case 'DELIVERED':
      return {
        label: 'Entregue',
        icon: Utensils,
        color: colors.slate[500],
        step: 4,
        bgColor: colors.slate[50]
      };
    default:
      return {
        label: status,
        icon: ShoppingBag,
        color: colors.slate[400],
        step: 0,
        bgColor: colors.slate[50]
      };
  }
};

// ===== COMPONENTE DO CARD =====
const OrderCardComponent = ({ item }) => {
  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;

  return (
    <OrderCard>
      {/* HEADER */}
      <CardHeader>
        <HeaderLeft>
          <Utensils size={14} color={colors.brand[600]} />
          <View style={{ flex: 1 }}>
            <RestaurantName>{item.restaurantName}</RestaurantName>
            <OrderDate>
              {new Date(item.orderDate).toLocaleDateString('pt-AO', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </OrderDate>
          </View>
        </HeaderLeft>
      </CardHeader>

      {/* CONTENT - IMAGEM + DETALHES */}
      <CardContent>
        <SnackImage
          source={{
            uri: item.snackImage || 'https://via.placeholder.com/100?text=Lanche'
          }}
        />
        <InfoCol>
          <SnackName>{item.snackName}</SnackName>
          <Price>Kz {Number(item.price || 0).toFixed(2)}</Price>
          <LocationRow>
            <MapPin size={12} color={colors.slate[400]} />
            <LocationText>
              {item.location} • Assento {item.seatNumber}
            </LocationText>
          </LocationRow>
        </InfoCol>
      </CardContent>

      <Divider />

      {/* STATUS SECTION */}
      <StatusSection>
        <StatusRow>
          <StatusIcon size={16} color={statusConfig.color} />
          <StatusLabel color={statusConfig.color}>
            {statusConfig.label}
          </StatusLabel>
        </StatusRow>

        {/* PROGRESS BAR (Apenas para ativos) */}
        {['PENDING', 'PREPARING', 'READY'].includes(item.status) && (
          <ProgressBar>
            <ProgressSegment
              active={statusConfig.step >= 1}
              color={colors.orange[400]}
            />
            <ProgressSegment
              active={statusConfig.step >= 2}
              color={colors.blue[400]}
            />
            <ProgressSegment
              active={statusConfig.step >= 3}
              color={colors.emerald[400]}
            />
          </ProgressBar>
        )}

        {/* NOTIFICAÇÃO QUANDO PRONTO */}
        {item.status === 'READY' && (
          <NotificationBadge>
            <NotificationText>
              🔔 Seu pedido está pronto! Por favor, dirija-se ao balcão ou aguarde
              no assento {item.seatNumber}.
            </NotificationText>
          </NotificationBadge>
        )}

        {/* DETALHES OPCIONAIS */}
        {item.status === 'DELIVERED' && (
          <NotificationBadge style={{ backgroundColor: colors.slate[50], borderLeftColor: colors.slate[400] }}>
            <NotificationText style={{ color: colors.slate[700] }}>
              ✅ Pedido entregue. Obrigado por usar MovePay!
            </NotificationText>
          </NotificationBadge>
        )}

        {item.status === 'CANCELLED' && (
          <NotificationBadge style={{ backgroundColor: colors.red[50], borderLeftColor: colors.red[500] }}>
            <NotificationText style={{ color: colors.red[800] }}>
              ❌ Pedido cancelado. {item.cancelReason || 'Sem motivo informado.'}
            </NotificationText>
          </NotificationBadge>
        )}
      </StatusSection>
    </OrderCard>
  );
};

// ===== TELA PRINCIPAL =====
export default function FoodOrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active'); // active | history
  const { activeOrders, pastOrders, isLoading, error, refetch } = useFoodOrders();

  const data = activeTab === 'active' ? activeOrders : pastOrders;

  const renderItem = ({ item }) => <OrderCardComponent item={item} />;

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* HEADER */}
      <Header>
        <BackButton onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.slate[900]} />
        </BackButton>
        <HeaderTitle>Meus Pedidos de Comida</HeaderTitle>
        <RefreshButton onPress={() => refetch()}>
          <RefreshCw size={20} color={colors.brand[600]} />
        </RefreshButton>
      </Header>

      {/* TABS */}
      <TabContainer>
        <TabButton active={activeTab === 'active'} onPress={() => setActiveTab('active')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TabText active={activeTab === 'active'}>Em Andamento</TabText>
            <TabBadge active={activeTab === 'active'}>
              <BadgeText active={activeTab === 'active'}>{activeOrders.length}</BadgeText>
            </TabBadge>
          </View>
        </TabButton>

        <TabButton active={activeTab === 'history'} onPress={() => setActiveTab('history')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TabText active={activeTab === 'history'}>Histórico</TabText>
            <TabBadge active={activeTab === 'history'}>
              <BadgeText active={activeTab === 'history'}>{pastOrders.length}</BadgeText>
            </TabBadge>
          </View>
        </TabButton>
      </TabContainer>

      {/* CONTENT */}
      {error && (
        <ErrorContainer>
          <AlertCircle size={20} color={colors.red[600]} />
          <ErrorText>Erro ao carregar pedidos. Tente novamente.</ErrorText>
        </ErrorContainer>
      )}

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} size="large" />
          <Text style={{ marginTop: spacing[4], color: colors.slate[600], fontSize: fontSize.sm }}>
            Carregando pedidos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.orderId}
          contentContainerStyle={{ paddingBottom: spacing[6] }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.brand[600]} />
          }
          ListEmptyComponent={
            <EmptyContainer>
              <ShoppingBag size={48} color={colors.slate[400]} />
              <EmptyText>
                {activeTab === 'active'
                  ? 'Você não tem pedidos em andamento'
                  : 'Nenhum histórico de pedidos'}
              </EmptyText>
            </EmptyContainer>
          }
          scrollEnabled={data.length > 0}
        />
      )}
    </Container>
  );
}
