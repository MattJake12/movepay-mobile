// File: src/hooks/useToast.js

import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

export function useToast() {
  const showSuccess = (message) => {
    Toast.show({
      type: 'success',
      text1: 'Sucesso',
      text2: message,
    });
  };

  const showError = (message) => {
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: message,
    });
  };

  const showInfo = (message) => {
    Toast.show({
      type: 'info',
      text1: 'Informação',
      text2: message,
    });
  };

  return { showSuccess, showError, showInfo };
}

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}
