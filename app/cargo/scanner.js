import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Vibration, Alert, TouchableOpacity } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { X, Package, CheckCircle, Truck, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';
import api from '../../src/services/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { OperatorGuard } from '../../src/components/OperatorGuard';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  flex: 1;
  background-color: #000;
`;

const Overlay = styled.SafeAreaView`
  flex: 1;
  justify-content: space-between;
  padding: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
`;

const BackButton = styled.TouchableOpacity`
  width: 44px; 
  height: 44px; 
  align-items: center; 
  justify-content: center;
  background-color: rgba(255,255,255,0.2); 
  border-radius: 22px;
`;

const Title = styled.Text`
  color: ${colors.white};
  font-size: 18px;
  font-weight: bold;
`;

const ScannerFrame = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const FrameBorder = styled.View`
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
  background-color: ${colors.orange[500]};
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

// Result Modal
const ResultContainer = styled.View`
  background-color: ${colors.white};
  padding: 20px;
  border-radius: 20px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-top-width: 1px;
  border-color: ${colors.slate[200]};
`;

const ResultHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const ResultContent = styled.View`
  gap: 8px;
`;

const Label = styled.Text`
  font-size: 12px;
  color: ${colors.slate[500]};
  text-transform: uppercase;
  font-weight: bold;
`;

const Value = styled.Text`
  font-size: 16px;
  color: ${colors.slate[900]};
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatusBadge = styled.View`
  background-color: ${props => props.color || colors.slate[100]};
  padding: 6px 12px;
  border-radius: 8px;
  align-self: flex-start;
  margin-bottom: 12px;
`;

const StatusText = styled.Text`
  color: ${props => props.textColor || colors.slate[700]};
  font-weight: bold;
  font-size: 12px;
`;

const Button = styled.TouchableOpacity`
  background-color: ${colors.brand[600]};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 16px;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-weight: bold;
  font-size: 16px;
`;

export default function CargoScanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cargoData, setCargoData] = useState(null);

  // Mutation para buscar pacote
  const trackMutation = useMutation({
    mutationFn: async (code) => {
      // Simulação ou chamada real
      // return api.get(`/cargo/track/${code}`);
      
      // MOCK para demonstração imediata se endpoint não existir
      return new Promise((resolve) => setTimeout(() => resolve({
        data: {
          id: code,
          trackingCode: code,
          sender: 'Delcio Félix',
          recipient: 'Maria Souza',
          destination: 'Huambo, Centro',
          status: 'IN_TRANSIT',
          type: 'ENVELOPE'
        }
      }), 500));
    },
    onSuccess: (data) => {
      Vibration.vibrate();
      setCargoData(data.data);
    },
    onError: () => {
      Vibration.vibrate([0, 50, 50, 50]);
      Alert.alert('Erro', 'Pacote não encontrado.');
      setScanned(false);
    }
  });

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    trackMutation.mutate(data);
  };

  const resetScan = () => {
    setScanned(false);
    setCargoData(null);
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>Precisamos de permissão para usar a câmera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <OperatorGuard>
    <Container>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "code128"],
        }}
      />
      
      <Overlay>
        <Header>
          <BackButton onPress={() => router.back()}>
            <ArrowLeft color={colors.white} size={24} />
          </BackButton>
          <Title>Scanner de Cargas</Title>
          <View style={{width: 44}} />
        </Header>

        {!cargoData && (
          <ScannerFrame>
            <FrameBorder>
              <LaserLine />
            </FrameBorder>
            <HintText>Posicione o código de rastreio ou QR da encomenda dentro da moldura</HintText>
          </ScannerFrame>
        )}
      </Overlay>

      {/* Cargo Result Sheet */}
      {cargoData && (
        <ResultContainer>
          <ResultHeader>
             <Package size={24} color={colors.brand[600]} />
             <View style={{marginLeft: 12}}>
               <ResultContent>
                 <Text style={{fontSize: 18, fontWeight: 'bold'}}>{cargoData.trackingCode}</Text>
                 <Text style={{color: colors.slate[500]}}>Encomenda {cargoData.type}</Text>
               </ResultContent>
             </View>
          </ResultHeader>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
             <View>
               <Label>Destinatário</Label>
               <Value>{cargoData.recipient}</Value>
             </View>
             <View>
               <Label>Destino</Label>
               <Value>{cargoData.destination}</Value>
             </View>
          </View>

          <StatusBadge color={colors.blue[50]}>
             <StatusText textColor={colors.blue[700]}>Status: {cargoData.status}</StatusText>
          </StatusBadge>

          <Button onPress={resetScan}>
            <ButtonText>Escanear Próximo</ButtonText>
          </Button>
        </ResultContainer>
      )}
    </Container>
    </OperatorGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
