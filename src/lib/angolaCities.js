// File: src/lib/angolaCities.js

/**
 * 🗺️ Coordenadas Reais das Cidades Principais de Angola
 * Usadas para desenhar trajetos e paragens no mapa
 *
 * Formato: { name, code, lat, lng, province }
 */

export const ANGOLA_CITIES = {
  // CAPITAL
  LUANDA: {
    name: 'Luanda',
    code: 'LUA',
    lat: -8.8383,
    lng: 13.2344,
    province: 'Luanda',
    description: 'Capital - Terminal Lic',
  },

  // INTERIOR (ROTAS PRINCIPAIS)
  BENGUELA: {
    name: 'Benguela',
    code: 'BNG',
    lat: -12.5733,
    lng: 13.0055,
    province: 'Benguela',
    description: 'Porto - Terminal Central',
  },

  HUAMBO: {
    name: 'Huambo',
    code: 'HUA',
    lat: -12.7764,
    lng: 15.7962,
    province: 'Huambo',
    description: 'Planalto Central',
  },

  SOYO: {
    name: 'Soyo',
    code: 'SOY',
    lat: -6.1347,
    lng: 12.3792,
    province: 'Zaire',
    description: 'Norte - Porto',
  },

  // PARAGENS INTERMEDIÁRIAS
  CUANZA_SUL: {
    name: 'Cuanza Sul',
    code: 'CSL',
    lat: -10.5639,
    lng: 13.7561,
    province: 'Cuanza Sul',
    description: 'Paragem intermediária',
  },

  LIBOLO: {
    name: 'Libolo',
    code: 'LBO',
    lat: -10.9833,
    lng: 14.8167,
    province: 'Cuanza Sul',
    description: 'Paragem intermediária',
  },

  GABELA: {
    name: 'Gabela',
    code: 'GBL',
    lat: -11.9667,
    lng: 13.6667,
    province: 'Benguela',
    description: 'Paragem intermediária',
  },

  QUIBALA: {
    name: 'Quibala',
    code: 'QBA',
    lat: -12.4833,
    lng: 14.6167,
    province: 'Kwanza Sul',
    description: 'Paragem intermediária',
  },

  BAILUNDO: {
    name: 'Bailundo',
    code: 'BLD',
    lat: -12.3333,
    lng: 16.0833,
    province: 'Huambo',
    description: 'Paragem intermediária',
  },

  ITA: {
    name: 'Ita',
    code: 'ITA',
    lat: -12.1667,
    lng: 14.0,
    province: 'Benguela',
    description: 'Paragem intermediária',
  },
};

/**
 * Buscar coordenadas de uma cidade
 * @param {string} cityName - Nome da cidade (ex: "Luanda")
 * @returns {Object} { name, lat, lng, ... }
 */
export const getCityCoordinates = (cityName) => {
  const city = Object.values(ANGOLA_CITIES).find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
  return city || null;
};

/**
 * Distância entre dois pontos em KM (fórmula Haversine)
 * @param {number} lat1, lng1 - Ponto 1
 * @param {number} lat2, lng2 - Ponto 2
 * @returns {number} Distância em KM
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Raio da Terra em KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calcular tempo estimado (assumindo ~70km/h média)
 * @param {number} distanceKm
 * @returns {string} Tempo formatado (ex: "2h 30m")
 */
export const calculateEstimatedTime = (distanceKm) => {
  const avgSpeed = 70; // km/h
  const hours = Math.floor(distanceKm / avgSpeed);
  const minutes = Math.round(((distanceKm % avgSpeed) / avgSpeed) * 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

/**
 * Rotas Predefinidas com Paragens
 */
export const PREDEFINED_ROUTES = {
  LUANDA_BENGUELA: {
    id: 'LUA-BNG',
    name: 'Luanda → Benguela',
    origin: 'Luanda',
    destination: 'Benguela',
    stops: ['Cuanza Sul', 'Libolo', 'Gabela'],
    distance: calculateDistance(
      ANGOLA_CITIES.LUANDA.lat,
      ANGOLA_CITIES.LUANDA.lng,
      ANGOLA_CITIES.BENGUELA.lat,
      ANGOLA_CITIES.BENGUELA.lng
    ),
  },
  LUANDA_HUAMBO: {
    id: 'LUA-HUA',
    name: 'Luanda → Huambo',
    origin: 'Luanda',
    destination: 'Huambo',
    stops: ['Cuanza Sul', 'Quibala', 'Bailundo'],
    distance: calculateDistance(
      ANGOLA_CITIES.LUANDA.lat,
      ANGOLA_CITIES.LUANDA.lng,
      ANGOLA_CITIES.HUAMBO.lat,
      ANGOLA_CITIES.HUAMBO.lng
    ),
  },
  BENGUELA_HUAMBO: {
    id: 'BNG-HUA',
    name: 'Benguela → Huambo',
    origin: 'Benguela',
    destination: 'Huambo',
    stops: ['Ita', 'Quibala'],
    distance: calculateDistance(
      ANGOLA_CITIES.BENGUELA.lat,
      ANGOLA_CITIES.BENGUELA.lng,
      ANGOLA_CITIES.HUAMBO.lat,
      ANGOLA_CITIES.HUAMBO.lng
    ),
  },
  LUANDA_SOYO: {
    id: 'LUA-SOY',
    name: 'Luanda → Soyo',
    origin: 'Luanda',
    destination: 'Soyo',
    stops: [],
    distance: calculateDistance(
      ANGOLA_CITIES.LUANDA.lat,
      ANGOLA_CITIES.LUANDA.lng,
      ANGOLA_CITIES.SOYO.lat,
      ANGOLA_CITIES.SOYO.lng
    ),
  },
};

/**
 * Obter lista de paragens com coordenadas completas
 * @param {string[]} stopsNames - ["Cuanza Sul", "Libolo"]
 * @returns {Object[]} [{ name, lat, lng, ... }]
 */
export const getStopsWithCoordinates = (stopsNames) => {
  return stopsNames.map((name) => getCityCoordinates(name)).filter((city) => city !== null);
};

// 📍 WAYPOINTS DETALHADOS (Para evitar rotas no mar)
// Lat/Lng aproximados da estrada EN100
const ROUTE_WAYPOINTS = {
  'LUA-BNG': [
    { lat: -8.8383, lng: 13.2344 }, // Luanda
    { lat: -9.3200, lng: 13.1600 }, // Barro do Cuanza
    { lat: -9.6800, lng: 13.2300 }, // Cabo Ledo
    { lat: -10.2000, lng: 13.5000 }, // Longa
    { lat: -10.7300, lng: 13.7600 }, // Porto Amboim
    { lat: -11.2000, lng: 13.8300 }, // Sumbe (Ponto mais a Lest)
    { lat: -11.8000, lng: 13.7000 }, // Canjala
    { lat: -12.3500, lng: 13.5400 }, // Lobito
    { lat: -12.5733, lng: 13.4055 }, // Benguela
  ],
};

/**
 * Obter rota detalhada (polilinha) entre duas cidades
 * Se existir uma rota predefinida de alta resolução, usa ela.
 * Senão, retorna a linha reta.
 */
export const getDetailedRoute = (originName, destinationName) => {
  const origin = getCityCoordinates(originName);
  const dest = getCityCoordinates(destinationName);

  if (!origin || !dest) return [];

  // Tenta encontrar chave 'ORIGEM-DESTINO' ou 'DESTINO-ORIGEM'
  const key1 = `${origin.code}-${dest.code}`;
  const key2 = `${dest.code}-${origin.code}`;

  if (ROUTE_WAYPOINTS[key1]) {
    return ROUTE_WAYPOINTS[key1];
  }

  if (ROUTE_WAYPOINTS[key2]) {
    // Se for o inverso, reverte o array
    return [...ROUTE_WAYPOINTS[key2]].reverse();
  }

  // Fallback: Linha reta (apenas origem e destino)
  return [
    { lat: origin.lat, lng: origin.lng },
    { lat: dest.lat, lng: dest.lng }
  ];
};
