// File: tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aponta para onde estão seus arquivos (app e src)
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // As mesmas cores do seu Web Admin
        brand: {
          50: '#f5f3ff',  // Roxo bem claro (Fundo de badges)
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed', // <--- A COR PRIMÁRIA (Botões, Ícones ativos)
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065', // Roxo super escuro (Gradientes)
        },
        slate: {
          50: '#f8fafc',  // Fundo principal (Light mode)
          100: '#f1f5f9', // Fundo de cards/inputs
          200: '#e2e8f0', // Bordas sutis
          300: '#cbd5e1',
          400: '#94a3b8', // Textos secundários
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Textos principais
          900: '#0f172a', // Preto suave
        }
      },
      fontFamily: {
        // Vamos usar a Inter para manter a elegância
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        bold: ['Inter_700Bold'],
        extrabold: ['Inter_800ExtraBold'],
      }
    },
  },
  plugins: [],
}