// File: app/driver/check-in.js

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Updated to CameraView (Expo SDK 50+)
import { useRouter, useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import { X, Zap, ZapOff, CheckCircle2, XCircle } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../src/lib/api';
import { useToastStore } from '../../src/services/toastService';
import { OperatorGuard } from '../../src/components/OperatorGuard';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.black};
`;

const Header = styled.View`
  position: absolute;
  top: 50px;
  left: 20px;
  right: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const IconButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(0,0,0,0.5);
  align-items: center;
  justify-content: center;
`;

const TitleBadge = styled.View`
  background-color: rgba(0,0,0,0.5);
  padding: 8px 16px;
  border-radius: 20px;
`;

const TitleText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
`;

const Overlay = styled.View`
  flex: 1;
  background-color: 'transparent';
  align-items: center;
  justify-content: center;
`;

const ScanFrame = styled.View`
  width: 280px;
  height: 280px;
  border-width: 2px;
  border-color: ${colors.brand[400]};
  border-radius: 24px;
  align-items: center;
  justify-content: center;
  background-color: rgba(255,255,255,0.1);
`;

const LaserLine = styled.View`
  width: 260px;
  height: 2px;
  background-color: ${colors.red[500]};
  opacity: 0.8;
`;

const HintText = styled.Text`
  color: ${colors.white};
  text-align: center;
  margin-top: 20px;
  font-size: ${fontSize.sm}px;
  opacity: 0.8;
  max-width: 250px;
`;

// Result Modal (Success/Error)
const ResultModal = styled.View`
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
  background-color: ${props => props.success ? colors.white : colors.red[50]};
  padding: 20px;
  border-radius: 16px;
  flex-direction: row;
  align-items: center;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
  border-left-width: 6px;
  border-left-color: ${props => props.success ? colors.emerald[500] : colors.red[500]};
`;

const ResultInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const ResultTitle = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: 18px;
  color: ${props => props.success ? colors.emerald[700] : colors.red[700]};
`;

const ResultMessage = styled.Text`
  color: ${props => props.success ? colors.slate[600] : colors.red[600]};
  font-size: 13px;
  margin-top: 2px;
`;

export default function CheckInScannerScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success: true/false, message: '...', passenger: '...' }

  const queryClient = useQueryClient();

  // Mutation para validar bilhete
  const validateMutation = useMutation({
    mutationFn: async (qrData) => {
      // Input pode vir como objeto { type, data } ou string direta
      const code = typeof qrData === 'object' ? qrData.data : qrData; 
      
      console.log('🔍 Validando QR:', code);

      // Se tem tripId, usa endpoint específico da viagem
      // Senão, usa validação global (qualquer bilhete da operadora)
      if (tripId && tripId !== 'latest') {
        return api.post(`/operator/trips/${tripId}/validate-ticket`, { 
          qrCode: code 
        });
      } else {
        // Validação global - sem contexto de viagem
        return api.post('/operator/validate', { code });
      }
    },
    onSuccess: (response) => {
      const { data } = response.data; // { ticket: {...}, user: {...}, status: 'USED' }
      
      Vibration.vibrate([0, 100, 50, 100]); // 2 beeps = Sucesso
      
      setScanResult({
        success: true,
        title: 'BEM-VINDO A BORDO',
        message: `${data.ticket?.user?.name || 'Passageiro'}`,
        detail: `Poltrona ${data.ticket?.seatNumber} • ${data.message || 'Validado'}`
      });

      useToastStore.getState().showToast(`Bilhete validado com sucesso!`, 'success');

      // Reset após 3s
      setTimeout(() => {
          setScanResult(null);
          setScanned(false);
      }, 3000);
      
      // Atualizar lista de manifesto em segundo plano
      queryClient.invalidateQueries(['trip-manifest', tripId]);
    },
    onError: (error) => {
      Vibration.vibrate(500); // 1 buzz longo
      
      const msg = error.response?.data?.message || 'Bilhete não encontrado ou inválido.';
      
      setScanResult({
        success: false,
        title: 'ACESSO NEGADO',
        message: msg,
        detail: 'Verifique se é a viagem correta.'
      });
      
      useToastStore.getState().showToast(msg, 'error');

      setTimeout(() => {
          setScanResult(null);
          setScanned(false);
      }, 3000);
    }
  });

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  if (!permission.granted) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <HintText>Precisamos de acesso à câmera para validar bilhetes.</HintText>
        <TitleBadge style={{ marginTop: 20 }}>
          <TitleText onPress={requestPermission}>Autorizar Câmera</TitleText>
        </TitleBadge>
      </Container>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    // Validar formato básico (Pode ser URL ou ID direto)
    // Ex: "https://movepay.ao/check?t=TOKEN" ou "UUID-DO-TICKET"
    console.log(`Scanned: ${data} (${type})`);
    
    setScanned(true);
    
    // Tentar extrair ID se for URL
    let ticketId = data;
    if (data.includes('?t=')) {
      ticketId = data.split('?t=')[1];
    }

    validateMutation.mutate(ticketId);
  };

  return (
    <OperatorGuard>
    <Container>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <Header>
        <IconButton onPress={() => router.back()}>
          <X size={24} color={colors.white} />
        </IconButton>

        <TitleBadge>
          <TitleText>CHECK-IN MODO CONTÍNUO</TitleText>
        </TitleBadge>

        <IconButton onPress={() => setTorch(!torch)}>
          {torch ? <ZapOff size={24} color={colors.yellow[400]} /> : <Zap size={24} color={colors.white} />}
        </IconButton>
      </Header>

      {/* CAMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"], 
        }}
      >
        <Overlay>
          {!scanResult && (
            <ScanFrame>
              <LaserLine />
            </ScanFrame>
          )}

          {!scanResult && (
             <HintText>Posicione o QR Code no quadrado</HintText>
          )}
        </Overlay>
      </CameraView>

      {/* RESULTADO OVERLAY (Não bloqueia totalmente, só mostra feedback) */}
      {scanResult && (
        <ResultModal success={scanResult.success}>
          {scanResult.success ? (
            <CheckCircle2 size={32} color={colors.emerald[600]} />
          ) : (
            <XCircle size={32} color={colors.red[600]} />
          )}
          
          <ResultInfo>
            <ResultTitle success={scanResult.success}>{scanResult.title}</ResultTitle>
            <ResultMessage success={scanResult.success}>{scanResult.message}</ResultMessage>
          </ResultInfo>
        </ResultModal>
      )}

    </Container>
    </OperatorGuard>
  );
}
