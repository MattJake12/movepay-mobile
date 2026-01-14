// File: src/components/Toast/ToastContainer.js

import React from 'react';
import styled from 'styled-components/native';
import { Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToastStore } from '../../services/toastService';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

// ===== STYLED COMPONENTS =====
const SafeContainer = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: box-none;
  z-index: 9999;
  padding-horizontal: ${spacing[3]}px;
  padding-top: ${spacing[2]}px;
`;

const ToastBox = styled(Animated.View)`
  margin-vertical: ${spacing[1]}px;
  border-radius: 8px;
  padding-horizontal: ${spacing[3]}px;
  padding-vertical: ${spacing[2]}px;
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.bgColor};
  elevation: 6;
  shadow-color: ${colors.slate[900]};
  shadow-opacity: 0.25;
  shadow-radius: 3px;
  shadow-offset: 0px 2px;
`;

const ToastContent = styled.Pressable`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const Icon = styled.Text`
  font-size: ${fontSize.lg}px;
  margin-right: ${spacing[2]}px;
`;

const Message = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.medium};
  flex: 1;
`;

const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return colors.emerald[500];
      case 'error':
        return colors.red[500];
      case 'warning':
        return colors.amber[500];
      case 'info':
      default:
        return colors.blue[500];
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <SafeContainer>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
          backgroundColor={getBackgroundColor(toast.type)}
          icon={getIcon(toast.type)}
        />
      ))}
    </SafeContainer>
  );
};

/**
 * Individual Toast Item with Animation
 */
const Toast = ({ toast, onClose, backgroundColor, icon }) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
    }).start();

    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 8,
      }).start(() => {
        onClose();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [scaleAnim, onClose]);

  return (
    <ToastBox
      bgColor={backgroundColor}
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <ToastContent activeOpacity={0.7} onPress={onClose}>
        <Icon>{icon}</Icon>
        <Message>{toast.message}</Message>
      </ToastContent>
    </ToastBox>
  );
};

export default ToastContainer;
