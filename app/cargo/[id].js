import React, { useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Package, MapPin, Calendar, Phone, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useParcelTracking } from '../../src/hooks/useDriverOperations';
import { colors, spacing, fontSize, fontWeight, shadows, borderRadius } from '../../src/theme/theme';
import { OperatorGuard } from '../../src/components/OperatorGuard';

// ===== STYLED COMPONENTS =====
const Container = styled(SafeAreaView)`
  flex: 1; 
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  padding: 24px; 
  background: linear-gradient(135deg, ${colors.brand[600]} 0%, ${colors.brand[700]} 100%);
  border-bottom-left-radius: 24px; 
  border-bottom-right-radius: 24px;
`;

const NavRow = styled.View`
  flex-direction: row; 
  align-items: center; 
  margin-bottom: 24px;
`;

const HeaderTitle = styled.Text`
  font-size: 20px; 
  font-weight: bold; 
  color: ${colors.white}; 
  margin-left: 16px;
`;

const TrackingCode = styled.Text`
  font-size: 32px; 
  font-weight: 900; 
  color: ${colors.white}; 
  letter-spacing: 2px;
  margin-top: 12px;
`;

const StatusBadge = styled.View`
  background-color: ${props => props.color}; 
  padding-horizontal: 12px; 
  padding-vertical: 6px; 
  border-radius: 8px; 
  align-self: flex-start; 
  margin-top: 12px;
`;

const StatusText = styled.Text`
  font-weight: bold; 
  color: ${colors.white}; 
  font-size: 12px; 
  text-transform: uppercase;
`;

const Content = styled.ScrollView`
  flex: 1; 
  padding: 24px;
`;

const Card = styled.View`
  background-color: ${colors.white}; 
  border-radius: 16px; 
  padding: 20px; 
  margin-bottom: 24px; 
  ${shadows.sm}
`;

const CardTitle = styled.Text`
  font-size: 14px; 
  font-weight: bold; 
  color: ${colors.slate[400]}; 
  text-transform: uppercase; 
  margin-bottom: 16px;
  letter-spacing: 0.5px;
`;

const DetailRow = styled.View`
  flex-direction: row; 
  justify-content: space-between; 
  margin-bottom: 16px;
`;

const DetailColumn = styled.View`
  flex: 1;
  margin-right: 24px;
`;

const Label = styled.Text`
  color: ${colors.slate[500]}; 
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const Value = styled.Text`
  color: ${colors.slate[900]}; 
  font-weight: 600; 
  font-size: 16px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${colors.slate[200]};
  margin-vertical: 12px;
`;

// Timeline Components
const TimelineItem = styled.View`
  flex-direction: row; 
  margin-bottom: 24px;
`;

const TimelineLeft = styled.View`
  align-items: center; 
  width: 40px;
  position: relative;
`;

const TimelineLine = styled.View`
  position: absolute; 
  top: 24px; 
  bottom: -24px; 
  width: 2px; 
  background-color: ${colors.slate[200]};
`;

const TimelineDot = styled.View`
  width: 16px; 
  height: 16px; 
  border-radius: 8px; 
  background-color: ${props => props.active ? colors.brand[600] : colors.slate[300]};
  border-width: 2px; 
  border-color: ${colors.white}; 
  z-index: 2;
`;

const TimelineContent = styled.View`
  flex: 1; 
  margin-left: 12px;
`;

const HistoryStatus = styled.Text`
  font-weight: bold; 
  font-size: 16px; 
  color: ${colors.slate[900]};
`;

const HistoryLoc = styled.Text`
  color: ${colors.slate[500]}; 
  font-size: 14px; 
  margin-top: 4px;
`;

const HistoryDesc = styled.Text`
  color: ${colors.slate[400]}; 
  font-size: 13px; 
  margin-top: 2px;
`;

const HistoryDate = styled.Text`
  color: ${colors.slate[400]}; 
  font-size: 12px; 
  margin-top: 6px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ErrorContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.red[50]};
  padding: 16px;
  margin: 24px 24px 0;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${colors.red[200]};
`;

const ErrorText = styled.Text`
  flex: 1;
  margin-left: 12px;
  color: ${colors.red[700]};
  font-size: 14px;
  font-weight: 500;
`;

const RefreshButton = styled.TouchableOpacity`
  padding: 8px;
`;

export default function CargoDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Código de rastreio (ex: MP-PKG-8842)
  const { parcel, isLoading, error, refetch } = useParcelTracking(id);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return colors.emerald[500];
      case 'ARRIVED': return colors.blue[500];
      case 'IN_TRANSIT': return colors.amber[500];
      case 'RECEIVED': return colors.slate[400];
      default: return colors.slate[300];
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'RECEIVED': '📦 Recebida',
      'IN_TRANSIT': '🚌 Em Trânsito',
      'ARRIVED': '✅ Chegou',
      'DELIVERED': '🎉 Entregue'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color={colors.brand[600]} />
        </LoadingContainer>
      </Container>
    );
  }

  if (!parcel) {
    return (
      <Container>
        <Header>
          <NavRow>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color={colors.white} size={24} />
            </TouchableOpacity>
            <HeaderTitle>Rastreamento</HeaderTitle>
          </NavRow>
        </Header>
        <ErrorContainer>
          <AlertCircle size={20} color={colors.red[600]} />
          <ErrorText>Encomenda não encontrada</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <OperatorGuard>
    <Container>
      <Header>
        <NavRow>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color={colors.white} size={24} />
          </TouchableOpacity>
          <HeaderTitle>Rastreamento</HeaderTitle>
          <RefreshButton onPress={handleRefresh} disabled={isRefreshing}>
            <RefreshCw 
              color={colors.white} 
              size={20}
              style={{ opacity: isRefreshing ? 0.5 : 1 }}
            />
          </RefreshButton>
        </NavRow>
        <TrackingCode>{parcel.trackingCode}</TrackingCode>
        <StatusBadge color={getStatusColor(parcel.status)}>
          <StatusText>{getStatusLabel(parcel.status)}</StatusText>
        </StatusBadge>
      </Header>

      {error && (
        <ErrorContainer>
          <AlertCircle size={20} color={colors.red[600]} />
          <ErrorText>{error?.message || 'Erro ao carregar detalhes'}</ErrorText>
        </ErrorContainer>
      )}

      <Content
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.brand[600]}
          />
        }
      >
        {/* Timeline de Eventos */}
        <Card>
          <CardTitle>📍 Histórico de Eventos</CardTitle>
          {parcel.history && parcel.history.map((event, index) => (
            <TimelineItem key={index}>
              <TimelineLeft>
                {index !== parcel.history.length - 1 && <TimelineLine />}
                <TimelineDot active={index === 0} />
              </TimelineLeft>
              <TimelineContent>
                <HistoryStatus>{event.status.replace(/_/g, ' ')}</HistoryStatus>
                <HistoryLoc>{event.location}</HistoryLoc>
                {event.description && <HistoryDesc>{event.description}</HistoryDesc>}
                <HistoryDate>{new Date(event.createdAt).toLocaleString('pt-AO')}</HistoryDate>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Card>

        {/* Informações do Envio */}
        <Card>
          <CardTitle>📦 Informações do Envio</CardTitle>
          
          <DetailRow>
            <DetailColumn>
              <Label>Origem</Label>
              <Value>{parcel.origin}</Value>
            </DetailColumn>
            <DetailColumn>
              <Label>Destino</Label>
              <Value>{parcel.destination}</Value>
            </DetailColumn>
          </DetailRow>

          <Divider />

          <DetailRow>
            <DetailColumn>
              <Label>Peso</Label>
              <Value>{parcel.weight} Kg</Value>
            </DetailColumn>
            <DetailColumn>
              <Label>Preço</Label>
              <Value>{parseFloat(parcel.price).toFixed(2)} Kz</Value>
            </DetailColumn>
          </DetailRow>

          {parcel.description && (
            <>
              <Divider />
              <DetailRow>
                <DetailColumn>
                  <Label>Descrição</Label>
                  <Value>{parcel.description}</Value>
                </DetailColumn>
              </DetailRow>
            </>
          )}
        </Card>

        {/* Dados do Remetente */}
        <Card>
          <CardTitle>👤 Remetente</CardTitle>
          
          <DetailRow>
            <DetailColumn>
              <Label>Nome</Label>
              <Value>{parcel.senderName}</Value>
            </DetailColumn>
          </DetailRow>

          <Divider />

          <DetailRow>
            <DetailColumn>
              <Label>Telefone</Label>
              <Value>{parcel.senderPhone}</Value>
            </DetailColumn>
          </DetailRow>
        </Card>

        {/* Dados do Destinatário */}
        <Card>
          <CardTitle>🎯 Destinatário</CardTitle>
          
          <DetailRow>
            <DetailColumn>
              <Label>Nome</Label>
              <Value>{parcel.receiverName}</Value>
            </DetailColumn>
          </DetailRow>

          <Divider />

          <DetailRow>
            <DetailColumn>
              <Label>Telefone</Label>
              <Value>{parcel.receiverPhone}</Value>
            </DetailColumn>
          </DetailRow>
        </Card>

        {/* Informações da Viagem */}
        {parcel.trip && (
          <Card>
            <CardTitle>🚌 Viagem Atribuída</CardTitle>
            
            <DetailRow>
              <DetailColumn>
                <Label>Rota</Label>
                <Value>{parcel.trip.origin} → {parcel.trip.destination}</Value>
              </DetailColumn>
            </DetailRow>

            <Divider />

            <DetailRow>
              <DetailColumn>
                <Label>Autocarro</Label>
                <Value>{parcel.trip.bus?.model || 'N/A'}</Value>
              </DetailColumn>
              <DetailColumn>
                <Label>Empresa</Label>
                <Value>{parcel.trip.company?.name || 'N/A'}</Value>
              </DetailColumn>
            </DetailRow>
          </Card>
        )}
      </Content>
    </Container>
    </OperatorGuard>
  );
}
