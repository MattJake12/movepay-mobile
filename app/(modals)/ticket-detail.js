// File: app/(modals)/ticket-detail.jsx

import React, { useState } from 'react';
import { 
  View, 
  ActivityIndicator, 
  Platform, 
  Share, 
  StatusBar, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { 
  X, 
  Share2, 
  Download, 
  Bus, 
  QrCode, 
  MapPin, 
  Calendar,
  Clock
} from 'lucide-react-native';
import api from '../../src/lib/api';
import { colors, spacing, fontSize, fontWeight, shadows } from '../../src/theme/theme';
import { useSocket } from '../../src/hooks/useSocket';
import QRCodeSVG from 'react-native-qrcode-svg';

// ===== FUNÇÕES AUXILIARES =====

// Gera o HTML para o PDF
// ===== HELPERS =====
const getBusClass = (type) => {
  switch (type) {
    case 'EXECUTIVE': return 'Executivo';
    case 'VIP': return 'Leito VIP';
    default: return type || 'Standard';
  }
};

const generateTicketHTML = (ticket) => {
  const date = ticket?.trip?.departureTime ? new Date(ticket.trip.departureTime).toLocaleDateString('pt-AO') : 'Data Indisponível';
  const time = ticket?.trip?.departureTime ? new Date(ticket.trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora Indisponível';
  
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; background-color: #f8fafc; }
          .ticket { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 30px; color: white; text-align: center; }
          .route { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .bus-type { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
          .body { padding: 30px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 20px; }
          .col { display: flex; flex-direction: column; }
          .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
          .value { font-size: 18px; color: #0f172a; font-weight: bold; }
          .qr-section { text-align: center; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px; opacity: 0.9;">${ticket?.trip?.company?.name || 'OPERADORA'}</div>
            <div class="route">${ticket?.trip?.origin || 'Origem'} ➝ ${ticket?.trip?.destination || 'Destino'}</div>
            <div class="bus-type">CLASSE ${getBusClass(ticket?.trip?.bus?.type).toUpperCase()}</div>
          </div>
          <div class="body">
            <div class="row">
              <div class="col">
                <span class="label">Data</span>
                <span class="value">${date}</span>
              </div>
              <div class="col" style="align-items: flex-end;">
                <span class="label">Horário</span>
                <span class="value">${time}</span>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <span class="label">Passageiro</span>
                <span class="value">${ticket?.passenger?.name || 'Passageiro'}</span>
              </div>
              <div class="col" style="align-items: flex-end;">
                <span class="label">Assento</span>
                <span class="value" style="color: #7c3aed; font-size: 24px;">${ticket?.seatNumber || '-'}</span>
              </div>
            </div>
            <div class="row" style="border-bottom: none;">
              <div class="col">
                <span class="label">Bilhete ID</span>
                <span class="value" style="font-family: monospace;">${ticket?.id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
              </div>
              <div class="col" style="align-items: flex-end;">
                <span class="label">Preço</span>
                <span class="value">Kz ${ticket?.trip?.price?.toLocaleString('pt-AO') || '0'}</span>
              </div>
            </div>
            <div class="qr-section">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket?.id || 'invalid'}" alt="QR Code" width="150" />
              <p style="margin-top: 10px; font-size: 12px; color: #64748b;">Apresente ao motorista</p>
            </div>
          </div>
        </div>
        <div class="footer">Gerado por MovePay App</div>
      </body>
    </html>
  `;
};

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[4]}px ${spacing[6]}px;
  background-color: ${colors.white};
  z-index: 10;
  /* Topo seguro para modais no iOS */
  padding-top: ${Platform.OS === 'ios' ? 20 : spacing[4]}px; 
`;

const HeaderTitle = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const CloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  background-color: ${colors.slate[100]};
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: ${spacing[6]}px;
`;

// O "PASSBOOK" (Cartão Principal - Estilo Apple Wallet)
const PassContainer = styled.View.attrs({
  style: shadows.lg
})`
  background-color: ${colors.white};
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: ${spacing[8]}px;
`;

// Topo do Pass (Gradiente da Marca)
const PassHeader = styled(LinearGradient).attrs({
  colors: [colors.brand[600], colors.brand[800]],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  padding: ${spacing[6]}px;
  align-items: center;
  padding-bottom: ${spacing[8]}px; /* Espaço extra para o rasgo */
`;

const CompanyLogoContainer = styled.View.attrs({
  style: shadows.sm
})`
  width: 64px;
  height: 64px;
  background-color: ${colors.white};
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[3]}px;
`;

const TripRoute = styled.Text`
  font-size: ${fontSize.xl}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.white};
  text-align: center;
`;

const TripSubtext = styled.Text`
  font-size: ${fontSize.xs}px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: ${spacing[1]}px;
  font-weight: ${fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// Ticket Status Badge
const StatusBadge = styled.View`
  background-color: ${props => 
    props.status === 'VALID' ? 'rgba(34, 197, 94, 0.2)' : 
    props.status === 'USED' ? 'rgba(148, 163, 184, 0.2)' : 
    props.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
  padding-horizontal: 12px;
  padding-vertical: 4px;
  border-radius: 12px;
  margin-top: ${spacing[3]}px;
  border-width: 1px;
  border-color: ${props => 
    props.status === 'VALID' ? '#4ade80' : 
    props.status === 'USED' ? '#cbd5e1' : 
    props.status === 'CANCELLED' ? '#f87171' : '#fbbf24'};
`;

const StatusText = styled.Text`
  color: ${props => 
    props.status === 'VALID' ? '#bbf7d0' : 
    props.status === 'USED' ? '#f1f5f9' : 
    props.status === 'CANCELLED' ? '#fecaca' : '#fde68a'};
  font-size: 11px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Corpo do Pass
const PassBody = styled.View`
  padding: ${spacing[6]}px;
  padding-top: ${spacing[8]}px; /* Espaço para compensar o rasgo */
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing[6]}px;
  border-bottom-width: ${props => props.last ? 0 : 1}px;
  border-bottom-color: ${colors.slate[100]};
  padding-bottom: ${props => props.last ? 0 : spacing[4]}px;
  border-style: ${props => props.last ? 'solid' : 'dashed'};
`;

const InfoBlock = styled.View`
  flex: 1;
  align-items: ${props => props.align || 'flex-start'};
`;

const Label = styled.Text`
  font-size: 10px;
  color: ${colors.slate[400]};
  text-transform: uppercase;
  font-weight: ${fontWeight.bold};
  letter-spacing: 0.5px;
  margin-bottom: ${spacing[1]}px;
`;

const Value = styled.Text`
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
`;

const MonoValue = styled(Value)`
  font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
  font-size: ${fontSize.base}px;
  letter-spacing: 1px;
  color: ${colors.slate[600]};
`;

// Área do QR Code (Destacada)
const QRSection = styled.View`
  align-items: center;
  margin-top: ${spacing[2]}px;
  padding-top: ${spacing[6]}px;
  background-color: ${colors.slate[50]};
  border-radius: 12px;
  padding-bottom: ${spacing[4]}px;
`;

const QRCodeContainer = styled.View`
  padding: ${spacing[2]}px;
  background-color: ${colors.white};
  border-radius: 12px;
  /* QR Code deve ser escaneável, alto contraste */
`;

const QRCodeImage = styled.View`
  width: 160px;
  height: 160px;
  align-items: center;
  justify-content: center;
`;

const ScanText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[400]};
  margin-top: ${spacing[3]}px;
  text-align: center;
  font-weight: ${fontWeight.medium};
`;

const TicketIdText = styled.Text`
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  margin-top: ${spacing[1]}px;
  text-align: center;
  font-family: monospace;
`;

// Efeito de "Picote" (Rasgo) - Geometria Pura
const RipContainer = styled.View`
  height: 24px;
  width: 100%;
  position: absolute;
  top: 155px; /* Ajuste manual baseado na altura do Header */
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  z-index: 20;
`;

const RipCircleLeft = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${colors.slate[50]}; /* Cor do fundo da tela */
  margin-left: -12px;
`;

const RipCircleRight = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${colors.slate[50]}; /* Cor do fundo da tela */
  margin-right: -12px;
`;

const RipLine = styled.View`
  flex: 1;
  height: 1px;
  border-top-width: 2px;
  border-color: ${colors.slate[50]};
  border-style: dashed;
  margin-horizontal: 8px;
  opacity: 0.5;
`;

// Botões de Ação
const ActionsContainer = styled.View`
  flex-direction: column;
  gap: ${spacing[4]}px;
  padding-bottom: ${spacing[12]}px;
`;

const ActionButton = styled.TouchableOpacity.attrs(props => ({
  style: !props.primary ? shadows.sm : undefined
}))`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.primary ? colors.slate[900] : 
                        props.tracker ? colors.brand[50] : colors.white}; /* Update 1: Added tracker style */
  padding: ${spacing[4]}px;
  border-radius: 16px;
  border-width: ${props => props.primary ? 0 : 1}px;
  border-color: ${props => props.tracker ? colors.brand[200] : colors.slate[200]}; /* Update 2: Border color for tracker */
  gap: ${spacing[2]}px;
`;

const ActionText = styled.Text`
  font-weight: ${fontWeight.bold};
  color: ${props => props.primary ? colors.white : 
             props.tracker ? colors.brand[700] : colors.slate[700]}; /* Update 3: Text color for tracker */
  font-size: ${fontSize.sm}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${colors.slate[50]};
`;

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  // Buscar bilhete real ou usar mock se não encontrar
  const { data: ticket, isLoading, refetch } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        return res.data.data;
      } catch (error) {
        // Fallback Mock para demonstração se a API falhar
        console.log("⚠️ API falhou, usando mock para ticket detail");
        return {
          id: id || 'TKT-8842-X',
          seatNumber: '12A',
          status: 'VALID',
          passenger: { name: 'João da Silva' },
          trip: {
            origin: 'Luanda',
            destination: 'Benguela',
            departureTime: new Date().toISOString(),
            price: 12500,
            company: { name: 'Macon', logoUrl: null },
            bus: { type: 'VIP Leito' }
          }
        };
      }
    }
  });

  // Listener para status em tempo real (Socket.io)
  React.useEffect(() => {
    if (!socket || !ticket?.trip?.id) return;

    // Entrar na sala da viagem
    socket.emit('join_trip', ticket.trip.id);
    console.log(`🔌 Entrando na sala da viagem: trip-${ticket.trip.id}`);

    const handleTicketValidated = (data) => {
      // Se a validação for para ESTE bilhete
      if (data.ticketId === ticket.id || data.ticketId === id) {
        Alert.alert("✅ Check-in Confirmado", "Seu bilhete foi validado com sucesso!");
        // Atualizar UI instantaneamente
        refetch(); // Recarrega os dados do servidor
        queryClient.invalidateQueries(['ticket', id]);
      }
    };

    socket.on('ticket-validated', handleTicketValidated);

    return () => {
      socket.off('ticket-validated', handleTicketValidated);
    };
  }, [socket, ticket?.trip?.id, ticket?.id]);

  // 1. Gerar e Compartilhar PDF (Unificado)
  const handleShareAction = async (actionType = 'share') => {
    if (!ticket) return;
    
    setIsDownloading(true);
    try {
      // 1. Gerar HTML com os dados do bilhete
      const html = generateTicketHTML(ticket);

      // 2. Criar PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      // 3. Compartilhar/Salvar arquivo
      // Nota: No mobile, shareAsync abre a "Share Sheet" que serve tanto para enviar (WhatsApp) quanto salvar (Arquivos)
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: actionType === 'save' ? 'Salvar Bilhete' : 'Partilhar Bilhete via...'
      });

    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar o bilhete.");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || !ticket) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </LoadingContainer>
    );
  }

  const dateStr = ticket?.trip?.departureTime 
    ? new Date(ticket.trip.departureTime).toLocaleDateString('pt-AO') 
    : 'Data N/A';
  const timeStr = ticket?.trip?.departureTime 
    ? new Date(ticket.trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '--:--';

  return (
    <Container>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <Header>
        <HeaderTitle>Bilhete Digital</HeaderTitle>
        <CloseButton onPress={() => router.back()}>
          <X size={20} color={colors.slate[600]} />
        </CloseButton>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        
        {/* PASSBOOK CARD */}
        <PassContainer>
          {/* Topo Colorido */}
          <PassHeader>
            <CompanyLogoContainer>
              <Bus size={32} color={colors.brand[600]} />
            </CompanyLogoContainer>
            <TripRoute>{ticket?.trip?.origin || 'Origem'} ➔ {ticket?.trip?.destination || 'Destino'}</TripRoute>
            <TripSubtext>{ticket?.trip?.company?.name || 'Operadora'} • Classe {getBusClass(ticket?.trip?.bus?.type)}</TripSubtext>
            
            <StatusBadge status={ticket?.status}>
              <StatusText status={ticket?.status}>
                {ticket?.status === 'VALID' ? 'Válido • Aguardando Embarque' :
                 ticket?.status === 'USED' ? 'Validado / Utilizado' :
                 ticket?.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
              </StatusText>
            </StatusBadge>
          </PassHeader>

          {/* Dados do Bilhete */}
          <PassBody>
            <InfoRow>
              <InfoBlock>
                <Label>DATA</Label>
                <Value>{dateStr}</Value>
              </InfoBlock>
              <InfoBlock align="flex-end">
                <Label>HORA</Label>
                <Value>{timeStr}</Value>
              </InfoBlock>
            </InfoRow>

            <InfoRow>
              <InfoBlock>
                <Label>PASSAGEIRO</Label>
                <Value style={{ fontSize: 16 }}>{ticket?.passenger?.name || 'Passageiro'}</Value>
              </InfoBlock>
              <InfoBlock align="flex-end">
                <Label>ASSENTO</Label>
                <Value style={{ color: colors.brand[600], fontSize: 24 }}>{ticket?.seatNumber || '-'}</Value>
              </InfoBlock>
            </InfoRow>

            <InfoRow last>
              <InfoBlock>
                <Label>PLATAFORMA</Label>
                <Value>A-04</Value>
              </InfoBlock>
              <InfoBlock align="flex-end">
                <Label>BILHETE ID</Label>
                <MonoValue>{ticket?.id?.slice(0, 8).toUpperCase() || 'N/A'}</MonoValue>
              </InfoBlock>
            </InfoRow>

            {/* QR Code - Código escaneável com ID do bilhete */}
            <QRSection>
              <QRCodeContainer>
                <QRCodeImage>
                  <QRCodeSVG
                    value={ticket?.id || 'invalid'}
                    size={160}
                    color="#0f172a"
                    backgroundColor="#ffffff"
                  />
                </QRCodeImage>
              </QRCodeContainer>
              <ScanText>Apresente este código ao motorista</ScanText>
              <TicketIdText>ID: {ticket?.id?.slice(0, 8).toUpperCase() || 'N/A'}</TicketIdText>
            </QRSection>
          </PassBody>

          {/* Elemento de "Rasgo" sobreposto */}
          <RipContainer pointerEvents="none">
            <RipCircleLeft />
            <RipLine />
            <RipCircleRight />
          </RipContainer>

        </PassContainer>

        {/* AÇÕES */}
        <ActionsContainer>
          {/* BOTÃO RASTREAR AUTOCARRO */}
          <View style={{ width: '100%' }}>
            <ActionButton 
              tracker 
              onPress={() => router.push({
                pathname: '/(modals)/tracking',
                params: { tripId: ticket.trip?.id }
              })}
            >
              <MapPin size={20} color={colors.brand[600]} />
              <ActionText tracker>Rastrear Autocarro</ActionText>
            </ActionButton>
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <ActionButton onPress={() => handleShareAction('save')} disabled={isDownloading}>
            {isDownloading ? (
              <ActivityIndicator color={colors.slate[700]} size="small" />
            ) : (
              <>
                <Download size={20} color={colors.slate[700]} />
                <ActionText>Salvar PDF</ActionText>
              </>
            )}
          </ActionButton>
          
          <ActionButton primary onPress={() => handleShareAction('share')} disabled={isDownloading}>
            <Share2 size={20} color={colors.white} />
            <ActionText primary>Partilhar</ActionText>
          </ActionButton>
          </View>
        </ActionsContainer>

      </Content>
    </Container>
  );
}