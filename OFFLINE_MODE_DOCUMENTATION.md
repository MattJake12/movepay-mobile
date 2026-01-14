# 📡 Offline Mode & Cache Persistence - MovePay Mobile

## 🎯 Overview

O sistema de offline mode do MovePay permite que a aplicação mobile continue funcionando mesmo sem conexão com a internet, com sincronização automática quando a conexão volta.

## 🏗️ Arquitetura

### 1. **Network Detection** (`useNetworkStatus`)
```javascript
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';

const MyComponent = () => {
  const { isOnline, networkType } = useNetworkStatus();
  
  return (
    <Text>
      {isOnline ? 'Online' : 'Offline'} via {networkType}
    </Text>
  );
};
```

**O que detecta:**
- Conexão ativa (WiFi, 4G, etc)
- Reachabilidade (é possível alcançar a internet?)
- Tipo de rede
- Mudanças de estado em tempo real

---

### 2. **Request Queue** (`useOfflineQueue`)
```javascript
import { useOfflineQueue } from '@/src/hooks/useOfflineQueue';

const MyComponent = () => {
  const { enqueueRequest, queueSize, isSyncing, isOnline } = useOfflineQueue();
  
  // Enfileirar uma requisição
  const handleOfflineAction = async () => {
    await enqueueRequest({
      method: 'PATCH',
      url: '/operator/trips/123/price',
      data: { price: 50000 }
    });
  };
  
  return (
    <>
      <Text>Fila: {queueSize} itens</Text>
      <Text>Sincronizando: {isSyncing ? 'Sim' : 'Não'}</Text>
    </>
  );
};
```

**Funcionalidades:**
- Enfileira requisições HTTP quando offline
- Armazena em AsyncStorage
- Processa automaticamente ao voltar online
- Retry com backoff exponencial (1s, 2s, 4s, max 30s)
- Invalidar queries após sincronização bem-sucedida

---

### 3. **Persistent Cache** (`queryClientConfig`)
```javascript
// Configurado automaticamente em app/_layout.js
// - Armazena queries em AsyncStorage
// - Máximo de 24 horas
// - Stale time de 5 minutos
// - Garbage collection de 24 horas
```

**Benefícios:**
- Dados de viagens permanecem após app fecha
- Dashboard carrega instantaneamente
- Passageiros podem ver tickets offline

---

### 4. **Visual Indicators** (`OfflineIndicator`)

Mostra na parte superior da app:
- 🟢 **Online** - Conexão ativa, tipo de rede
- 🟡 **Sincronizando** - Processando fila de requisições
- 🔴 **Offline** - Sem conexão, dica de sincronização ao conectar

---

## 📱 Exemplo: Operador Atualizando Preço Offline

```javascript
// app/(tabs)/operator.js
const handleUpdatePrice = async () => {
  if (isOnline) {
    // Online: enviar direto
    await api.patch(`/operator/trips/${tripId}/price`, { price });
    Alert.alert('✅ Sucesso', 'Preço atualizado');
  } else {
    // Offline: enfileirar
    await enqueueRequest({
      method: 'PATCH',
      url: `/operator/trips/${tripId}/price`,
      data: { price }
    });
    Alert.alert('⏳ Pendente', 'Será atualizado ao conectar');
  }
};
```

**Fluxo:**
1. Operador edita preço → enfileira se offline
2. Enfileirada no AsyncStorage
3. Indicador mostra "1 pendente"
4. Quando volta online → sincroniza automaticamente
5. Queries invalidadas → UI atualiza

---

## 🔄 Sincronização Automática

### Quando ocorre:
- ✅ App inicia e detecta conexão
- ✅ Usuário voltar online (mudança de rede)
- ✅ Manualmente via `processQueue()`

### Retry Strategy:
```
Tentativa 1: 1 segundo
Tentativa 2: 2 segundos  
Tentativa 3: 4 segundos
Tentativa 4: 8 segundos (máximo 30s)
```

### Tratamento de Erros:
- 🔄 Requisições que falham permanecem na fila
- ⚠️ Erro de rede: Retry automático
- ❌ Erro 4xx (400, 404, etc): Remove da fila
- 📝 Logs detalhados no console

---

## 💾 Armazenamento

### AsyncStorage Keys:
- `@movepay_offline_queue` - Fila de requisições pendentes
- `@tanstack/react-query` - Cache de queries (internal)

### Estrutura da Fila:
```json
[
  {
    "id": "1702555200000",
    "timestamp": "2025-12-14T10:00:00Z",
    "method": "PATCH",
    "url": "/operator/trips/123/price",
    "data": { "price": 50000 }
  }
]
```

---

## 🔐 Boas Práticas

### 1. Sempre usar hooks de status
```javascript
✅ const { isOnline } = useNetworkStatus();
❌ Não assumir que navigator.onLine está correto
```

### 2. Dar feedback ao usuário
```javascript
✅ Alert.alert('⏳ Pendente', 'Será enviado ao conectar');
❌ Silenciosamente enfileirar sem avisar
```

### 3. Invalidar queries após operações
```javascript
✅ queryClient.invalidateQueries({ queryKey: ['operator:trips'] });
❌ Não atualizar UI após sincronização
```

### 4. Testar em baixa conectividade
```bash
# iOS Simulator
Hardware → Network Link Conditioner

# Android Emulator  
Settings → Developer options → Network throttling
```

---

## 🧪 Testando Offline Mode

### No Simulator:
```javascript
// 1. Ativar "Airplane Mode"
// 2. Ou simular conexão lenta
// iOS: XCode → Debug → Simulate Location
// Android: Emulator → Settings → Developer → Simulate Connectivity
```

### No Device Real:
```javascript
// 1. Ligar Airplane Mode
// 2. Desabilitar WiFi/4G
// 3. App continua funcionando
// 4. Desligar Airplane Mode
// 5. Alterações sincronizam automaticamente
```

---

## 📊 Monitoring

### Logs de Debug:
```javascript
// Network Status
[NetworkStatus] { online: true, type: 'wifi', ... }

// Offline Queue
[OfflineQueue] Requisição enfileirada: { method: 'PATCH', ... }
[OfflineQueue] Processando: request-id
[OfflineQueue] Sucesso: request-id
[OfflineQueue] Sincronização completa: { processadas: 1, ... }
```

### Console:
```bash
# Em desenvolvimento
adb logcat | grep "OfflineQueue"   # Android
log stream --predicate 'eventMessage contains[cd] OfflineQueue'  # iOS
```

---

## 🚀 Próximos Passos

- [ ] Implementar UI para manualmente sincronizar fila
- [ ] Adicionar notificação quando sincronização completa
- [ ] Compressão de dados offline (gzip)
- [ ] Limite de tamanho de cache (max 50MB)
- [ ] Analytics: rastrear retenção offline

---

## 🆘 Troubleshooting

### "Fila nunca sincroniza"
- [ ] Verificar se `isOnline` está correto
- [ ] Confirmar que `NetInfo` está bem configurado
- [ ] Verificar logs: `[OfflineQueue]`

### "Dados duplicados após sincronização"
- [ ] Certifique-se de invalidar queries
- [ ] Verifique se o backend é idempotente

### "AsyncStorage cheio"
- [ ] Limpar cache antigo: `CTRL+Shift+K` (React Native Debugger)
- [ ] Ou: `AsyncStorage.clear()`

---

**Created:** Dec 14, 2025  
**Version:** 1.0.0
