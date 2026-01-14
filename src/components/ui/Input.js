// File: src/components/ui/Input.js

import React, { useState, forwardRef } from 'react';
import { TextInput, TouchableOpacity, View, Text, Animated } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme/theme';

const InputComponent = forwardRef(function Input({ 
  label, 
  icon: Icon, 
  error, 
  isPassword,
  returnKeyType,
  blurOnSubmit,
  style,
  ...props 
}, ref) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const defaultReturnKeyType = returnKeyType || (isPassword ? 'done' : 'next');
  const defaultBlurOnSubmit = blurOnSubmit !== undefined ? blurOnSubmit : isPassword;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleValue, {
      toValue: 1.02,
      useNativeDriver: false,
      speed: 20,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: false,
      speed: 20,
    }).start();
  };

  return (
    <View style={{ marginBottom: 0 }}>
      {label && (
        <Text style={{
          fontSize: fontSize.sm,
          fontWeight: fontWeight.semibold,
          color: colors.slate[700],
          marginBottom: spacing[2],
        }}>
          {label}
        </Text>
      )}
      
      <Animated.View style={{
        transform: [{ scale: scaleValue }],
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: isFocused ? colors.white : colors.slate[50],
        borderWidth: 2,
        borderColor: error ? colors.red[500] : (isFocused ? colors.blue[500] : colors.slate[200]),
        borderRadius: 14,
        paddingHorizontal: spacing[4],
        paddingVertical: 0,
        shadowColor: isFocused ? colors.blue[500] : colors.slate[900],
        shadowOffset: { width: 0, height: isFocused ? 8 : 2 },
        shadowOpacity: isFocused ? 0.25 : 0.08,
        shadowRadius: isFocused ? 12 : 4,
        elevation: isFocused ? 12 : 3,
        ...style,
      }}>
        {Icon && (
          <View style={{
            width: 20,
            height: 20,
            marginRight: spacing[3],
            opacity: isFocused ? 1 : 0.5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Icon 
              size={20} 
              color={isFocused ? colors.blue[500] : colors.slate[400]} 
              strokeWidth={isFocused ? 2.5 : 2}
            />
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={{
            flex: 1,
            fontSize: fontSize.base,
            color: colors.slate[900],
            fontWeight: fontWeight.medium,
            padding: 0,
            margin: 0,
            height: '100%',
            letterSpacing: 0.3,
          }}
          placeholderTextColor={colors.slate[400]}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={defaultReturnKeyType}
          blurOnSubmit={defaultBlurOnSubmit}
          editable={true}
          selectTextOnFocus={true}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={{
              paddingLeft: spacing[2],
              width: 30,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.slate[400]} />
            ) : (
              <Eye size={20} color={colors.slate[400]} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Text style={{
          color: colors.red[500],
          fontSize: fontSize.xs,
          marginTop: spacing[1],
        }}>
          {error}
        </Text>
      )}
    </View>
  );
});

InputComponent.displayName = 'Input';

export const Input = InputComponent;