// File: app/(tabs)/_layout.js

import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { 
  Home, 
  Ticket, 
  User, 
  Briefcase,  // Para Operador (Gestão de Frota)
  ScanLine,   // Para Validação (Scanner)
  ChefHat,    // Para Restaurante (Cozinha/KDS)
  Wallet      // Para Carteira (Opcional visualização)
} from 'lucide-react-native';

// Importações de Tema e Estado
import { colors, fontWeight } from '../../src/theme/theme';
import { useUserStore } from '../../src/store/useUserStore';

export default function TabsLayout() {
  // Obter dados do usuário para controle de acesso (RBAC)
  const user = useUserStore((state) => state.user);
  const userRole = user?.role || 'CUSTOMER';

  // Helpers para verificação de permissão
  // NOTA: ADMIN e RESTAURANT_MANAGER são bloqueados no login.js
  // O app mobile só permite CUSTOMER e OPERATOR_STAFF
  const isOperator = userRole === 'OPERATOR_STAFF';
  const isRestaurant = userRole === 'RESTAURANT_MANAGER'; // Não vai acontecer (bloqueado no login)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        
        // === ESTILIZAÇÃO DA BARRA DE NAVEGAÇÃO ===
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.slate[100],
          height: Platform.OS === 'ios' ? 88 : 68, // Altura maior para toque fácil
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 0, // Remove sombra padrão do Android (Flat Design)
          shadowOpacity: 0, // Remove sombra padrão do iOS
        },
        
        // === ESTILIZAÇÃO DO TEXTO ===
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: fontWeight.medium,
          marginTop: 4,
        },
        
        // === CORES ===
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.slate[400],
        
        // Remove efeito de ripple (onda) no Android para consistência visual
        tabBarItemStyle: Platform.OS === 'android' ? { paddingBottom: 4 } : {},
      }}
    >
      {/* 1. HOME (Explorar) - Visível para todos */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Home 
              size={24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      
      {/* 2. BILHETES (Minhas Viagens) - Visível para todos */}
      <Tabs.Screen
        name="my-trips"
        options={{
          title: 'Bilhetes',
          tabBarIcon: ({ color, focused }) => (
            <Ticket 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      {/* 3. VALIDAR (Scanner) - Apenas Operadores */}
      <Tabs.Screen
        name="validation"
        options={{
          title: 'Validar',
          tabBarIcon: ({ color, focused }) => (
            <ScanLine 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          // Esconde se não for Operador
          href: isOperator ? undefined : null,
        }}
      />

      {/* 4. RESTAURANTE (KDS) - Apenas Gerentes de Restaurante 
          ⚠️ IMPORTANTE: Certifique-se de criar o arquivo app/(tabs)/restaurant.js
      */}
      <Tabs.Screen
        name="restaurant"
        options={{
          title: 'Cozinha',
          tabBarIcon: ({ color, focused }) => (
            <ChefHat 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          // Esconde se não for Restaurante
          href: isRestaurant ? undefined : null,
        }}
      />

      {/* 5. OPERADOR (Frota) - Apenas Operadores */}
      <Tabs.Screen
        name="operator"
        options={{
          title: 'Frota',
          tabBarIcon: ({ color, focused }) => (
            <Briefcase 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          // Esconde se não for Operador
          href: isOperator ? undefined : null,
        }}
      />

      {/* 6. PERFIL - Visível para todos */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <User 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      
      {/* 
         ROTAS OCULTAS NA BARRA (Acessíveis via navegação, mas sem botão na tab bar)
      */}
      
      <Tabs.Screen
        name="wallet"
        options={{
          // href: null faz com que a rota exista mas não apareça na barra
          href: null, 
        }}
      />

    </Tabs>
  );
}