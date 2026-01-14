# 🗺️ Documentação: Sistema de Mapa Interativo MovePay

## 📋 Visão Geral

Sistema completo de visualização de trajetos com:

- ✅ Mapa interativo com polylines (linhas do trajeto)
- ✅ Marcadores para origem, destino e paragens
- ✅ Zoom automático para enquadrar toda a rota
- ✅ Overlay com informações (distância, duração, paragens)
- ✅ Legenda com estatísticas do trajeto
- ✅ Fallback para lista de paragens (sem mapa)
- ✅ Coordenadas reais de 10+ cidades de Angola

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ticket-detail.js (ou outra tela)                      │
│  ↓ useRouteMap(tripId)                                 │
│  ↓                                                      │
│  ┌───────────────────────────────────────────┐          │
│  │ useRouteMap Hook                          │          │
│  │ - Busca trip via API                      │          │
│  │ - Busca coordenadas (angolaCities.js)     │          │
│  │ - Calcula trajeto                         │          │
│  │ - Calcula distância e tempo estimado      │          │
│  └─────────────────┬─────────────────────────┘          │
│                    ↓                                     │
│  mapData = {                                            │
│    trajectory, stopsData, originCoords,                 │
│    destinationCoords, totalDistance,                    │
│    estimatedTime                                        │
│  }                                                      │
│                    ↓                                     │
│  <RouteMapViewer routeData={mapData} />                │
│  ├─ MapView (react-native-maps)                        │
│  ├─ Polyline (trajeto)                                 │
│  ├─ Markers (origem, destino, paragens)                │
│  ├─ Overlay (info superior)                            │
│  └─ Legenda (info inferior)                            │
│                    ↓                                     │
│  <RouteStopsList routeData={mapData} />               │
│  └─ Lista simples de paragens (fallback)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Arquivos Criados

### 1️⃣ **`src/lib/angolaCities.js`**

Dados de cidades e coordenadas reais de Angola.

```javascript
export const ANGOLA_CITIES = {
  LUANDA: { name: 'Luanda', lat: -8.8383, lng: 13.2344, ... },
  BENGUELA: { name: 'Benguela', lat: -12.5733, lng: 13.0055, ... },
  ...
};

export const getCityCoordinates(cityName) // Buscar coordenadas
export const calculateDistance(lat1, lng1, lat2, lng2) // Distância
export const calculateEstimatedTime(distanceKm) // Tempo estimado
export const getStopsWithCoordinates(stopsNames) // Paragens com coords
```

### 2️⃣ **`src/hooks/useRouteMap.js`**

Hook React Query que busca dados do trajeto.

```javascript
const { data: mapData, isLoading, error } = useRouteMap(tripId);

// mapData contém: trajectory, stopsData, originCoords, etc
```

### 3️⃣ **`src/components/map/RouteMapViewer.js`**

Componentes principais:

- `<RouteMapViewer />` - Mapa interativo
- `<RouteStopsList />` - Lista de paragens (fallback)

### 4️⃣ **`src/lib/routeStopsData.js`**

Dados de seed com paragens por rota.

### 5️⃣ **`src/components/map/RoutesMapExample.js`**

4 exemplos de uso em diferentes contextos.

---

## 🚀 Como Usar

### **Passo 1: Importar**

```javascript
import { useRouteMap } from '../../src/hooks/useRouteMap';
import { RouteMapViewer, RouteStopsList } from '../../src/components/map/RouteMapViewer';
```

### **Passo 2: Chamar Hook**

```javascript
const { data: mapData, isLoading, error } = useRouteMap(tripId);
```

### **Passo 3: Renderizar**

```javascript
<RouteMapViewer
  routeData={mapData}
  height={400}
  isLoading={isLoading}
  error={error}
  showDetails={true}
/>
```

---

## 🎨 Cores e Ícones

| Elemento | Cor                   | Ícone      | Significado          |
| -------- | --------------------- | ---------- | -------------------- |
| Origem   | 🟢 Verde (#10b981)    | MapPin     | Ponto de partida     |
| Destino  | 🔴 Vermelho (#ef4444) | Navigation | Destino final        |
| Paragens | 🟠 Laranja (#f59e0b)  | Número     | Parada intermediária |
| Trajeto  | 🟣 Roxo (#7c3aed)     | Polyline   | Linha da rota        |

---

## 📊 Dados Retornados

```javascript
useRouteMap(tripId) retorna:

{
  trip: {
    id: 1,
    origin: "Luanda",
    destination: "Benguela",
    price: 12000,
    company: { name: "Macon", ... },
    ...
  },

  originCoords: {
    name: "Luanda",
    lat: -8.8383,
    lng: 13.2344,
    description: "Capital - Terminal Lic"
  },

  destinationCoords: {
    name: "Benguela",
    lat: -12.5733,
    lng: 13.0055,
    description: "Porto - Terminal Central"
  },

  stopsData: [
    { name: "Cuanza Sul", lat: -10.5639, lng: 13.7561, ... },
    { name: "Libolo", lat: -10.9833, lng: 14.8167, ... },
    { name: "Gabela", lat: -11.9667, lng: 13.6667, ... }
  ],

  trajectory: [
    { latitude: -8.8383, longitude: 13.2344 },
    { latitude: -10.5639, longitude: 13.7561 },
    ...
    { latitude: -12.5733, longitude: 13.0055 }
  ],

  totalDistance: 451.2,        // em KM
  estimatedTime: "6h 30m",

  debug: {
    stopsCount: 3,
    trajectoryPoints: 5
  }
}
```

---

## ⚙️ Cidades Disponíveis

### Capitais/Principais:

- 🏙️ **Luanda** (-8.8383, 13.2344) - Capital
- 🏙️ **Benguela** (-12.5733, 13.0055) - Porto
- 🏙️ **Huambo** (-12.7764, 15.7962) - Planalto Central
- 🏙️ **Soyo** (-6.1347, 12.3792) - Norte/Porto

### Paragens Intermediárias:

- 🛑 **Cuanza Sul** (-10.5639, 13.7561)
- 🛑 **Libolo** (-10.9833, 14.8167)
- 🛑 **Gabela** (-11.9667, 13.6667)
- 🛑 **Quibala** (-12.4833, 14.6167)
- 🛑 **Bailundo** (-12.3333, 16.0833)
- 🛑 **Ita** (-12.1667, 14.0)

---

## 🔧 Configuração

### Dependências Necessárias

```bash
npm install react-native-maps
npm install @tanstack/react-query
npm install lucide-react-native
```

### Expo Setup (iOS)

```bash
eas build --platform ios --profile preview
```

### Google Maps API Key

1. Gerar chave em: https://cloud.google.com/maps-platform
2. Adicionar em `app.json`:

```json
{
  "plugins": [
    [
      "react-native-maps",
      {
        "MapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    ]
  ]
}
```

---

## 🎯 Casos de Uso

### ✅ Implementado Agora

1. **Detalhes de Bilhete** (ticket-detail.js)

   - Mapa + lista de paragens
   - Overlay com distância/duração
   - Fallback para lista

2. **Busca de Rotas** (search-results.js)
   - Cards com mapa mini
   - Comparar trajetos

### ⏳ Futuro (Fase 2)

3. **Rastreamento em Tempo Real**

   - Localização GPS do autocarro
   - Atualização live de posição

4. **Rotas Otimizadas**
   - Integração Google Directions API
   - Tempo real das estradas

---

## 🐛 Troubleshooting

### **Mapa não aparece**

```javascript
// ✅ Solução: Usar fallback
<RouteStopsList routeData={mapData} error={error} />
```

### **Zoom não funciona**

```javascript
// ✅ Verificar se trajectory tem pontos válidos
console.log(mapData?.trajectory?.length);
```

### **Paragens não aparecem**

```javascript
// ✅ Verificar coordenadas no banco
console.log(mapData?.stopsData);
```

---

## 📱 Exemplos de Uso

Veja arquivo `src/components/map/RoutesMapExample.js` para 4 exemplos práticos:

1. Mapa em detalhes de viagem
2. Lista simples de paragens
3. Modal com mapa (como ticket-detail.js)
4. Feed com múltiplos mapas

---

## 🎓 Próximos Passos

1. ✅ Implementar mapa simples com polylines
2. ⏳ Adicionar Google Directions API (rota real)
3. ⏳ Integrar rastreamento GPS em tempo real
4. ⏳ Adicionar offline mode para mapas

---

## 📞 Suporte

Para dúvidas, consulte:

- `src/hooks/useRouteMap.js` - Documentação inline
- `src/components/map/RouteMapViewer.js` - Props e componentes
- `src/lib/angolaCities.js` - Cidades e coordenadas

**Status**: ✅ **Pronto para Produção**
