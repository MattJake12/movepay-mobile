// File: src/polyfills.native.js

/**
 * Native Polyfills para styled-components/native
 * Fornece variáveis globais que styled-components espera
 */

// Polyfill para document (usado por styled-components em alguns casos)
if (typeof global !== 'undefined' && !global.document) {
  global.document = {
    createElement: (tag) => ({
      style: {},
      appendChild: () => {},
      removeChild: () => {},
    }),
    createTextNode: () => ({}),
    head: {
      appendChild: () => {},
    },
  };
}

// Polyfill para window
if (typeof global !== 'undefined' && !global.window) {
  global.window = global;
}

// Polyfill para navigator
if (typeof global !== 'undefined' && !global.navigator) {
  global.navigator = {
    userAgent: 'React Native',
  };
}

// ServerStyleSheet polyfill
if (typeof global !== 'undefined' && !global.ServerStyleSheet) {
  global.ServerStyleSheet = class {
    collectStyles() {
      return this;
    }
    getStyleTags() {
      return '';
    }
    seal() {}
  };
}
