# MovePay Mobile - Expo Router v3 com Zustand & TanStack Query

## 🚀 Estrutura do Projeto

```
mobile/
├── app/                          # Expo Router (Arquivo baseado)
│   ├── _layout.js                # Config Global (Fontes, QueryClient, Toast)
│   ├── index.js                  # Splash & Token Check
│   ├── (public)/                 # Telas Públicas (Onboarding, Login, Register)
│   ├── (tabs)/                   # Menu Inferior Persistente
│   ├── booking/                  # Fluxo de Compra (Stack)
│   └── (modals)/                 # Modais (Slide Up)
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Componentes Atômicos
│   │   ├── booking/              # Componentes Booking
│   │   └── cards/                # Cards Reutilizáveis
│   ├── hooks/                    # Lógica Customizada
│   ├── store/                    # Zustand Stores
│   └── services/                 # API & Cache
│
└── assets/                       # Fontes, Imagens, Animações
```

## 📦 Stack Tecnológico

### **Framework**
- **Expo Managed Workflow** - Iteração rápida sem precisar de Android/iOS Studio

### **Roteamento**
- **Expo Router v3** - Navegação baseada em arquivos (como Next.js)

### **UI & Estilização**
- **NativeWind (Tailwind CSS para React Native)** - Desenvolvimento rápido
- **react-native-gesture-handler** - Gestos complexos
- **@expo/vector-icons** - Ícones Ionicons

### **Estado & Cache**
- **Zustand** - Gerenciar carrinho, user, filtros
- **TanStack Query (React Query)** - Cache de API + funcionalidade offline
- **AsyncStorage** - Persistência local

### **Componentes**
- **@shopify/flash-list** - Listas otimizadas (não trava scrolling)
- **react-native-qrcode-svg** - Geração de QR Codes

### **Mapas & Localização**
- **react-native-maps** - Google Maps nativo (ready para integração)

### **Dados & API**
- **Axios** - Cliente HTTP
- **@react-native-async-storage/async-storage** - Storage local

## 🎯 Estrutura do Fluxo de Compra

### **Passo 1: Detalhes da Viagem**
- \`/booking/[id].js\` - Mostra horários, preço, tipo de ônibus
- Botão "Próximo" leva para seleção de assentos

### **Passo 2: Escolher Assentos**
- \`/booking/select-seats.js\` - Mapa visual com 12 filas x 4 assentos
- Assentos ocupados em cinza, disponíveis em branco, selecionados em laranja
- Legenda: Disponível | Selecionado | Indisponível

### **Passo 3: Adicionar Lanches**
- \`/booking/add-snacks.js\` - Lista com controles de quantidade
- Upsell com snacks, bebidas, almofadas
- Cada item tem preço e "Adicionar ao Carrinho"

### **Passo 4: Pagamento**
- \`/booking/payment.js\` - Seletor de método (Crédito, Débito, PIX)
- Resumo final (passagens + lanches)
- Botão "Confirmar Pagamento"

### **Passo 5: Confirmação**
- \`/booking/confirmation.js\` - Tela de sucesso + QR Code
- Botões para "Minhas Viagens" ou "Buscar Outra"

## 🔐 Autenticação

- **Login/Registro** em \`(public)/\`
- Token salvo em **AsyncStorage**
- **Interceptor Axios** adiciona bearer token automaticamente
- **Splash Screen** verifica token ao iniciar

## 📱 Tabs Persistentes

- **Home** (Busca) - Campo origem/destino/data + FlashList de viagens
- **Minhas Viagens** (Tickets) - Lista de bilhetes com QR Code
- **Perfil** - Dados do usuário + Logout

## 🛠 Como Começar

### 1. Instalar Dependências
\`\`\`bash
npm install
\`\`\`

### 2. Configurar Variáveis
Criar \`.env\`:
\`\`\`
EXPO_PUBLIC_API_URL=https://seu-backend.com/api
\`\`\`

### 3. Iniciar em Desenvolvimento
\`\`\`bash
npm start
# Escanear QR com Expo Go (iOS/Android)
\`\`\`

### 4. Build para Produção
\`\`\`bash
eas build --platform ios
eas build --platform android
\`\`\`

## 📋 Componentes Disponíveis

### UI Atômicos
- **Button** - Variantes: primary, secondary, outline
- **Input** - Com placeholder, segurança
- **Badge** - Status, tipos de ônibus

### Booking
- **SeatMap** - Mapa interativo de assentos
- **SnackItem** - Card de lanche com controle de quantidade
- **PaymentMethodSelector** - Seletor de método de pagamento

### Cards
- **TripCard** - Card da viagem com preço e duração
- **TicketCard** - Bilhete com gradiente laranja

## 📚 Hooks Disponíveis

### Queries
- **useTripsQuery** - Listar viagens com filtros
- **useTripDetailsQuery** - Detalhes de 1 viagem
- **useUserTicketsQuery** - Bilhetes do usuário
- **useSnacksQuery** - Lista de lanches

### Mutations
- **useCreateBookingMutation** - Criar reserva
- **useBookingDetailsQuery** - Detalhes da reserva

### Store
- **useAuthStore** - User, token, login/register/logout
- **useCartStore** - Assentos, lanches, total

## 🎨 Cores Padrão

- **Primária**: #FF6B35 (Laranja)
- **Sucesso**: #10B981 (Verde)
- **Fundo**: #F3F4F6 (Cinza muito claro)
- **Texto**: #111827 (Cinza escuro)

## 📤 Deployment

- **EAS Build** para iOS/Android
- **Expo Update** para hot updates sem App Store
- **GitHub Actions** para CI/CD automático

---

**Desenvolvido com ❤️ para MovePay**
