# ✅ Checklist de Desenvolvimento MovePay Mobile

## 🏗️ Estrutura Base
- [x] Pastas criadas (app, src)
- [x] Rotas configuradas (Expo Router)
- [x] Componentes UI criados
- [x] Hooks customizados
- [x] State management (Zustand)
- [x] Cache de dados (TanStack Query)

## ⚙️ Configuração
- [x] package.json com dependências
- [x] .env para variáveis
- [x] app.json (Expo)
- [x] tailwind.config.js
- [x] ESLint + Prettier
- [x] Jest config

## 📱 Telas Implementadas

### Públicas
- [x] Onboarding (carrossel)
- [x] Login
- [x] Register

### Autenticadas (Tabs)
- [x] Home (busca de viagens)
- [x] My Trips (bilhetes)
- [x] Profile (usuário)

### Booking (4 Passos)
- [x] Detalhes da viagem
- [x] Mapa de assentos
- [x] Adicionar lanches
- [x] Pagamento
- [x] Confirmação + QR Code

### Modais
- [x] Filtros
- [x] Detalhes do bilhete
- [x] Info dos ônibus

## 🔧 Próximas Etapas

### 1. Backend API
- [ ] Criar endpoints em Node/Express/Django
- [ ] Banco de dados (PostgreSQL/MongoDB)
- [ ] Autenticação JWT
- [ ] CRUD viagens, bilhetes, lanches

### 2. Integração Frontend
- [ ] Atualizar `src/services/api.js` com URLs reais
- [ ] Testar endpoints
- [ ] Tratar erros da API
- [ ] Implementar refresh token

### 3. Funcionalidades
- [ ] Google Maps (visuais das rotas)
- [ ] Notificações Push
- [ ] Câmera para QR Code
- [ ] Compartilhar bilhete
- [ ] Histórico de buscas

### 4. UI/UX
- [ ] Animações Lottie
- [ ] Transições suaves
- [ ] Loading states
- [ ] Empty states
- [ ] Temas (modo escuro)

### 5. Performance
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Code splitting
- [ ] Testes de performance

### 6. Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Detox)

### 7. DevOps
- [ ] GitHub Actions
- [ ] EAS Build setup
- [ ] Staging environment
- [ ] Production build

### 8. Analytics
- [ ] Google Analytics
- [ ] Crash reporting (Sentry)
- [ ] User tracking

## 📚 Documentação
- [x] README.md
- [x] GETTING_STARTED.md
- [x] API_DOCS.md
- [ ] DEPLOYMENT.md
- [ ] CONTRIBUTING.md

## 🎯 Timeline Sugerido

```
Semana 1: Backend básico + integração API
Semana 2: Testes + correções
Semana 3: Funcionalidades extras
Semana 4: Deploy + otimizações
```

## 🔐 Segurança
- [ ] Validação de input
- [ ] Proteção contra XSS
- [ ] HTTPS/SSL
- [ ] Rate limiting
- [ ] Sanitização de dados

## 📊 Métricas
- [ ] Time to Interactive (TTI)
- [ ] Lighthouse score
- [ ] Crash rate
- [ ] User retention

---

**Atualizar este arquivo conforme progresso**
