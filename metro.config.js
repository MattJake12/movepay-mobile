// File: metro.config.js

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configurar resolver para polyfill de módulos Node.js
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer'),
};

// Adicionar polyfills ao início do bundle
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

module.exports = config;
