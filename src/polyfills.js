// File: src/polyfills.js

// Polyfills para styled-components em React Native
if (typeof document === 'undefined') {
  global.document = {
    documentElement: {},
    createElement: () => ({
      style: {},
      appendChild: () => {},
      removeChild: () => {},
    }),
  };
}

if (typeof window === 'undefined') {
  global.window = global;
}

// Polyfill para rehydrateSheet do styled-components
if (typeof HTMLCollection === 'undefined') {
  global.HTMLCollection = Array;
}

// Polyfill para getComputedStyle
if (typeof getComputedStyle === 'undefined') {
  global.getComputedStyle = () => ({});
}
