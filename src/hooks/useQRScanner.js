// mobile/src/hooks/useQRScanner.js

/**
 * 📱 QR CODE SCANNER HOOK
 * 
 * Gerencia a leitura de QR codes dos bilhetes
 * - Acesso à câmera
 * - Processamento de QR
 * - Validação de bilhete no backend
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useQRScanner = (tripId, onTicketValidated = null) => {
  const { user, token } = useAuth();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  /**
   * Abrir scanner de QR
   */
  const openScanner = useCallback(() => {
    setIsScannerOpen(true);
    setIsScanning(true);
    setValidationError(null);
  }, []);

  /**
   * Fechar scanner
   */
  const closeScanner = useCallback(() => {
    setIsScannerOpen(false);
    setIsScanning(false);
  }, []);

  /**
   * Processar QR code lido
   */
  const handleQRScanned = useCallback(async (scannedData) => {
    try {
      if (!scannedData || !tripId) {
        return;
      }

      // Evitar escanear múltiplas vezes o mesmo código
      if (lastScannedCode === scannedData) {
        return;
      }

      setLastScannedCode(scannedData);
      setIsScanning(true);
      setValidationError(null);

      // Extrair QR code (pode vir como { data: 'qr-code' } ou apenas 'qr-code')
      const qrCode = typeof scannedData === 'string' ? scannedData : scannedData.data;

      // Validar bilhete no backend
      const response = await fetch(
        `http://${process.env.BACKEND_IP || 'localhost'}:3000/api/operator/trips/${tripId}/validate-ticket`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ qrCode })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setValidationError({
          message: data.error || 'Erro ao validar bilhete',
          code: data.ticket?.status,
          ticket: data.ticket
        });
        setValidationResult(null);
        return;
      }

      // ✅ Bilhete validado
      setValidationResult({
        success: true,
        ticket: data.data.ticket,
        passenger: data.data.passenger
      });

      // Adicionar ao histórico de scans
      setRecentScans(prev => [
        {
          qrCode,
          ticket: data.data.ticket,
          passenger: data.data.passenger,
          timestamp: new Date(),
          status: 'VALID'
        },
        ...prev.slice(0, 9) // Manter últimos 10
      ]);

      // Callback
      if (onTicketValidated) {
        onTicketValidated(data.data);
      }

      // Parar scanner após validação bem-sucedida
      setTimeout(() => {
        setIsScanning(false);
      }, 1500);
    } catch (error) {
      console.error('Error scanning QR:', error);
      setValidationError({
        message: 'Erro ao comunicar com servidor',
        error: error.message
      });
      setValidationResult(null);
    }
  }, [tripId, token, lastScannedCode, onTicketValidated]);

  /**
   * Resetar estado
   */
  const resetValidation = useCallback(() => {
    setValidationResult(null);
    setValidationError(null);
    setLastScannedCode(null);
    setIsScanning(false);
  }, []);

  /**
   * Limpar histórico
   */
  const clearHistory = useCallback(() => {
    setRecentScans([]);
  }, []);

  return {
    isScannerOpen,
    isScanning,
    validationResult,
    validationError,
    recentScans,
    openScanner,
    closeScanner,
    handleQRScanned,
    resetValidation,
    clearHistory
  };
};
