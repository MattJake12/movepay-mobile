// File: src/suppressWarnings.js

import { YellowBox } from 'react-native';
import React from 'react';

// Suppress specific warnings from styled-components
if (YellowBox) {
  YellowBox.ignoreWarnings([
    'Animated: `useNativeDriver` was not specified',
    'Animated: useNativeDriver',
    'Non-serializable values were found in the navigation state',
  ]);
}

// Suppress console warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Body is unusable') ||
      args[0].includes('styled-components') ||
      args[0].includes('getNativeModuleVersions'))
  ) {
    return;
  }
  originalWarn(...args);
};
