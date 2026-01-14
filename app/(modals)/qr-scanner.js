// File: app/(modals)/qr-scanner.js

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { X, Zap, ZapOff, ScanLine } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import api from '../../src/lib/api';
import Toast from 'react-native-toast-message';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.black};
`;

// Wrapper da câmera para garantir flex: 1
const CameraContainer = styled.View`
  flex: 1;
`;

// Header Flutuante
const HeaderControls = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[4]}px ${spacing[6]}px;
  position: absolute;
  top: 40px; /* Safe Area manual para Modal */
  left: 0;
  right: 0;
  z-index: 20;
`;

const CloseButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
`;

const FlashButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${props => props.active ? colors.brand[600] : 'rgba(0, 0, 0, 0.5)'};
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${props => props.active ? colors.brand[500] : 'rgba(255, 255, 255, 0.2)'};
`;

const TitleContainer = styled.View`
  background-color: rgba(0, 0, 0, 0.5);
  padding-horizontal: 16px;
  padding-vertical: 8px;
  border-radius: 20px;
`;

const HeaderTitle = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.sm}px;
`;

// Overlay de Escaneamento (Máscara)
const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
`;

const ScanFrame = styled.View`
  width: 280px;
  height: 280px;
  border-radius: 24px;
  position: relative;
  justify-content: center;
  align-items: center;
`;

// Cantos do Frame
const Corner = styled.View`
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: ${colors.brand[500]};
  border-width: 4px;
  border-radius: 4px;
`;

const ScanLineAnim = styled.View`
  width: 100%;
  height: 2px;
  background-color: ${colors.brand[500]};
  opacity: 0.6;
  shadow-color: ${colors.brand[500]};
  shadow-offset: 0px 0px;
  shadow-opacity: 1;
  shadow-radius: 10px;
  elevation: 5;
`;

const Footer = styled.View`
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  align-items: center;
  padding-horizontal: ${spacing[6]}px;
`;

const Instructions = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize.lg}px;
  font-weight: ${fontWeight.bold};
  text-align: center;
  margin-bottom: ${spacing[2]}px;
`;

const SubText = styled.Text`
  color: ${colors.slate[400]};
  font-size: ${fontSize.sm}px;
  text-align: center;
`;

const PermissionView = styled.View`
  flex: 1;
  background-color: ${colors.slate[900]};
  align-items: center;
  justify-content: center;
  padding: ${spacing[6]}px;
`;

const PermissionText = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize.base}px;
  text-align: center;
  margin-bottom: ${spacing[6]}px;
  line-height: 24px;
`;

const Button = styled.TouchableOpacity`
  background-color: ${colors.brand[600]};
  padding: 16px 32px;
  border-radius: 12px;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

// IMPORTANTE: Export Default
export default function QRScannerModal() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  // Validação (Simulada ou Real)
  const validateMutation = useMutation({
    mutationFn: async (qrCode) => {
      // return api.post('/bookings/validate-qrcode', { qrCode }); // Real
      return new Promise(resolve => setTimeout(() => resolve({ data: { status: 'success' } }), 1000)); // Mock
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '✅ Bilhete Válido',
        text2: 'Embarque autorizado',
        visibilityTime: 2000
      });
      setTimeout(() => {
        setScanned(false);
        router.back();
      }, 2000);
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: '❌ Bilhete Inválido',
        text2: 'Tente novamente',
      });
      setTimeout(() => setScanned(false), 2000);
    }
  });

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <PermissionView>
        <StatusBar barStyle="light-content" />
        <ScanLine size={48} color={colors.brand[500]} style={{ marginBottom: 24 }} />
        <PermissionText>
          O MovePay precisa de acesso à câmera para ler os códigos QR dos bilhetes.
        </PermissionText>
        <Button onPress={requestPermission}>
          <ButtonText>Permitir Acesso</ButtonText>
        </Button>
      </PermissionView>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      validateMutation.mutate(data);
    }
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" hidden={false} />
      
      <CameraContainer>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        
        {/* Camada de UI sobre a câmera */}
        <HeaderControls>
          <CloseButton onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </CloseButton>
          
          <TitleContainer>
            <HeaderTitle>Ler Código QR</HeaderTitle>
          </TitleContainer>

          <FlashButton active={torch} onPress={() => setTorch(!torch)}>
            {torch ? <Zap size={24} color={colors.white} fill="white" /> : <ZapOff size={24} color={colors.white} />}
          </FlashButton>
        </HeaderControls>

        <Overlay>
          {/* Buraco transparente simulado visualmente pelo ScanFrame (A API do CameraView já cuida do preview) */}
          <ScanFrame>
            <Corner style={{ top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 }} />
            <Corner style={{ bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }} />
            
            {/* Indicador de Scan Ativo */}
            {!scanned && <ScanLineAnim />}
          </ScanFrame>
        </Overlay>

        <Footer>
          <Instructions>Posicione o código</Instructions>
          <SubText>O escaneamento iniciará automaticamente</SubText>
        </Footer>
      </CameraContainer>
      
      <Toast />
    </Container>
  );
}