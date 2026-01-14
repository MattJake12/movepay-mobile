// File: app/(tabs)/validation.js

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StatusBar, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScanLine, Zap, ZapOff, X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';
import { OperatorGuard } from '../../src/components/OperatorGuard';
import api from '../../src/lib/api';
import { useFocusEffect } from 'expo-router';

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  flex: 1;
  background-color: ${colors.black};
`;

// CameraWrapper removido em favor do uso direto de CameraView com StyleSheet

const Overlay = styled.View`
  flex: 1;
  /* background-color: rgba(0,0,0,0.5); REMOVIDO PARA TESTE: PODE ESTAR BLOQUEANDO O SCANNER */
  background-color: transparent; 
  justify-content: center;
  align-items: center;
`;

// Buraco transparente (Máscara simulada com bordas)
const ScanFrame = styled.View`
  width: 280px;
  height: 280px;
  border-radius: 24px;
  border-width: 2px;
  border-color: ${colors.white};
  background-color: transparent;
  overflow: hidden;
  position: relative;
`;

const Corner = styled.View`
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: ${colors.brand[500]};
  border-width: 4px;
  border-radius: 4px;
`;

const Instructions = styled.View`
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
  align-items: center;
`;

const TextInstruction = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  text-align: center;
  margin-bottom: 8px;
`;

const SubText = styled.Text`
  color: ${colors.slate[300]};
  font-size: ${fontSize.sm}px;
`;

const Controls = styled.View`
  position: absolute;
  top: 60px;
  right: 20px;
  gap: 16px;
`;

const ControlButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(255,255,255,0.2);
  align-items: center;
  justify-content: center;
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
  font-size: ${fontSize.lg}px;
  text-align: center;
  margin-bottom: ${spacing[4]}px;
`;

const Button = styled.TouchableOpacity`
  background-color: ${colors.brand[600]};
  padding: 16px 32px;
  border-radius: 12px;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-weight: bold;
`;

// Definição estática para evitar re-renderizações e reconfigurações constantes da câmera
// expo-camera 17+ usa strings minúsculas para barcodeTypes
const BARCODE_SETTINGS = {
  barcodeTypes: ["qr"],
};

export default function ValidationScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // UseRef serve como um "lock" síncrono para evitar múltiplos disparos rápidos
  const processingRef = useRef(false);
  
  // Monitorar foco na tela (porque as abas mantêm o componente montado)
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // Tela ganhou foco
      console.log('📸 [Validation] Tela ganhou foco - ativando scanner');
      setIsFocused(true);
      setScanned(false); // Reset scanner ao ganhar foco
      processingRef.current = false;
      
      return () => {
        // Tela perdeu foco
        console.log('📸 [Validation] Tela perdeu foco - desativando scanner');
        setIsFocused(false);
        setTorch(false); // Desativa lanterna ao sair
        setScanned(false);
        processingRef.current = false;
      };
    }, [])
  );

  useEffect(() => {
    console.log("📸 [Validation] Tela montada. Permissão:", permission?.granted, "Foco:", isFocused);
  }, [permission, isFocused]);

  const handleBarCodeScanned = useCallback(async (scanningResult) => {
    console.log('📸 [Validation] Código detectado!', scanningResult);

    // Verificações de segurança
    if (!permission?.granted || !isFocused || scanned || loading || processingRef.current) {
      console.log('⏭️ [Validation] Ignorando - já processando ou bloqueado');
      return;
    }

    const { data, type } = scanningResult;
    console.log(`📸 [Validation] Processando ${type}: ${data}`);

    // Ativa locks
    processingRef.current = true;
    setScanned(true);
    setLoading(true);

    try {
      console.log('🔄 [Validation] Validando bilhete...');
      const response = await api.post('/operator/validate', { code: data });
      
      console.log('✅ [Validation] Resposta:', response.data);
      if (response.data.success) {
        Alert.alert(
          "✅ Bilhete Válido", 
          `Passageiro: ${response.data.data?.user?.name || 'Desconhecido'}\nStatus: Embarque Autorizado`,
          [{ 
            text: "Próximo", 
            onPress: () => resetScanner()
          }]
        );
      } else {
         // Caso success false mas não estoure erro
         Alert.alert("⚠️ Atenção", "Bilhete inválido ou não reconhecido.", [{text: "OK", onPress: () => resetScanner()}]);
      }
      } catch (error) {
      console.error('❌ [Validation] Erro:', error.response?.status, error.response?.data?.error || error.message);
      
      // Tratamento específico para diferentes tipos de erro
      let title = "❌ Erro na Validação";
      let msg = "Falha ao validar bilhete.";
      
      if (error.response?.status === 404) {
        title = "⚠️ Bilhete Não Encontrado";
        msg = error.response?.data?.error || "Este bilhete não foi encontrado no sistema.";
      } else if (error.response?.status === 400) {
        title = "⚠️ Bilhete Inválido";
        msg = error.response?.data?.error || "Este bilhete não pode ser usado.";
      } else if (error.response?.status === 403) {
        title = "🚫 Acesso Negado";
        msg = error.response?.data?.error || "Você não tem permissão para validar este bilhete.";
      } else {
        msg = error.response?.data?.error || error.response?.data?.message || error.message || "Falha ao validar bilhete.";
      }
      
      Alert.alert(
        title, 
        msg,
        [{ 
          text: "OK", 
          onPress: () => resetScanner() 
        }]
      );
    } finally {
      // No finally, apenas removemos o loading visual.
      // O estado 'scanned' e 'processingRef' continuam true até o usuário clicar no Alert.
      setLoading(false);
    }
  }, [scanned, loading, isFocused, permission]);

  const resetScanner = () => {
    console.log("🔄 [Validation] Resetando scanner...");
    setScanned(false);
    processingRef.current = false;
  };

  if (!permission) return <View style={{flex:1, backgroundColor: colors.black}} />;

  if (!permission.granted) {
    return (
      <PermissionView>
        <PermissionText>Precisamos de acesso à câmera para validar bilhetes.</PermissionText>
        <Button onPress={requestPermission}>
          <ButtonText>Conceder Permissão</ButtonText>
        </Button>
      </PermissionView>
    );
  }

  // Se não estiver focado (usuário em outra aba), renderizamos um placeholder para economizar recursos
  if (!isFocused) {
    return <Container />;
  }

  return (
    <OperatorGuard>
    <Container>
      <StatusBar barStyle="light-content" />
      
      {/* CÂMERA */}
      <CameraView 
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"]
        }}
        onBarcodeScanned={(result) => {
          if (!scanned) {
            console.log('📸 [Validation] QR Detectado:', result.data);
            handleBarCodeScanned(result);
          }
        }}
        onCameraReady={() => console.log("✅ [Validation] Camera Ready")}
      />
      
      {/* INTERFACE (LAYER 2 - ABSOLUTE) */}
      <Overlay pointerEvents="box-none">
        
        {/* Frame visual */}
        <ScanFrame pointerEvents="none">
          <Corner style={{ top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 }} />
          <Corner style={{ top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 }} />
          <Corner style={{ bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 }} />
          <Corner style={{ bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }} />
          
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.brand[500]} />
            ) : (
              <ScanLine size={150} color={scanned ? colors.green[500] : colors.brand[500]} strokeWidth={0.5} />
            )}
          </View>
        </ScanFrame>

      </Overlay>

      <Controls>
        <ControlButton onPress={() => setTorch(!torch)}>
          {torch ? <Zap size={20} color="#fbbf24" /> : <ZapOff size={20} color="#fff" />}
        </ControlButton>
      </Controls>

      <Instructions pointerEvents="none">
        <TextInstruction>Validar Embarque</TextInstruction>
        <SubText>Aponte para o QR Code do passageiro</SubText>
      </Instructions>
    </Container>
    </OperatorGuard>
  );
}