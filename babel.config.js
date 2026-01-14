// File: babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'babel-plugin-styled-components',
        {
          displayName: true,
          ssr: false,
          pure: true,
          transpileTemplateLiterals: true,
        },
      ],
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/store': './src/store',
            '@/lib': './src/lib',
            '@/theme': './src/theme',
            '@/styles': './src/styles',
          },
        },
      ],
    ],
  };
};
