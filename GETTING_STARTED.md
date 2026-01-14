# 🚀 Guia Rápido - Primeiros Passos MovePay Mobile

## 1️⃣ Instalação Concluída ✅
```bash
npm install --legacy-peer-deps
```

## 2️⃣ Variáveis de Ambiente (.env)
```env
EXPO_PUBLIC_API_URL=https://seu-api.com/v1
EXPO_PUBLIC_APP_ENV=development
```

## 3️⃣ Iniciar o Projeto
```bash
npm start
```
- Escanear QR com **Expo Go** (iOS/Android)
- Ou pressionar `i` para iOS / `a` para Android

## 4️⃣ Estrutura de Pastas

```
app/                    # Rotas (Expo Router)
├── _layout.js         # Root layout
├── index.js           # Splash/Auth check
├── (public)/          # Login, Register, Onboarding
├── (tabs)/            # Home, My Trips, Profile
├── booking/           # Fluxo de compra (4 passos)
└── (modals)/          # Filtros, Detalhes, Info

src/
├── components/        # UI Reutilizáveis
├── hooks/            # Lógica customizada (useTrips, useAuth, etc)
├── store/            # Zustand (authStore, cartStore)
├── services/         # API & QueryClient
└── styles/           # Globals CSS
```

## 5️⃣ Stack Tecnológico

| Ferramenta | Uso |
|-----------|-----|
| **Expo** | Framework React Native |
| **Expo Router v3** | Navegação baseada em arquivos |
| **NativeWind** | Tailwind CSS para React Native |
| **Zustand** | Estado global (carrinho, auth) |
| **TanStack Query** | Cache & sincronização de dados |
| **Axios** | Client HTTP com interceptor |
| **AsyncStorage** | Persistência local |

## 6️⃣ Fluxo de Autenticação

```
Splash Screen (index.js)
   ↓
Verifica Token em AsyncStorage
   ├─ Token válido → (tabs)/home
   └─ Sem token → (public)/login
```

## 7️⃣ Fluxo de Compra (4 Passos)

```
1. Detalhes da Viagem
   ↓ Próximo
2. Escolher Assentos (SeatMap)
   ↓ Próximo
3. Adicionar Lanches (Upsell)
   ↓ Próximo
4. Pagamento & Confirmação
```

## 8️⃣ Integração Backend

### Endpoints Necessários

**Autenticação:**
```
POST /api/auth/login
POST /api/auth/register
```

**Viagens:**
```
GET /api/trips?origin=&destination=&date=
GET /api/trips/{id}
GET /api/snacks
```

**Booking:**
```
POST /api/bookings
GET /api/bookings/{id}
GET /api/tickets/user
GET /api/tickets/{id}
```

## 9️⃣ Exemplos de Uso

### Hook de Viagens
```javascript
import { useTripsQuery } from '@/src/hooks/useTrips';

const { data: trips, isLoading } = useTripsQuery({
  origin: 'São Paulo',
  destination: 'Rio de Janeiro',
  date: '2025-12-15'
});
```

### Store de Autenticação
```javascript
import { useAuthStore } from '@/src/store/authStore';

const { user, login, logout } = useAuthStore();
```

### Store de Carrinho
```javascript
import { useCartStore } from '@/src/store/cartStore';

const { addSnack, seats, total } = useCartStore();
```

## 🔟 Comandos Úteis

```bash
# Iniciar dev server
npm start

# Rodar testes
npm test

# Lint do código
npm run lint

# Build para iOS (requer EAS)
eas build --platform ios

# Build para Android
eas build --platform android
```

## 1️⃣1️⃣ Cores Padrão (NativeWind)

- **Primária**: `text-orange-500` (#FF6B35)
- **Sucesso**: `text-green-600` (#10B981)
- **Erro**: `text-red-600` (#DC2626)
- **Fundo**: `bg-gray-50` (#F9FAFB)

## 1️⃣2️⃣ Próximas Etapas

- [ ] Criar backend API
- [ ] Integrar endpoints em `src/services/api.js`
- [ ] Testar fluxo de compra
- [ ] Adicionar animações Lottie
- [ ] Implementar Google Maps
- [ ] Setup CI/CD com GitHub Actions
- [ ] Publicar no App Store / Google Play

---

**Dúvidas?** Consulte os componentes em `src/components/` ou hooks em `src/hooks/`
