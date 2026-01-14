// File: src/lib/routeStopsData.js

/**
 * 📍 Dados de Paragens Reais para Seed
 * Integra com angolaCities.js
 */

import { PREDEFINED_ROUTES } from '../src/lib/angolaCities';

/**
 * Dados de rotas com paragens para seed no banco
 * Baseado nas rotas predefinidas de Angola
 */
export const ROUTE_STOPS_DATA = [
  {
    tripId: 1, // Macon: Luanda → Benguela
    routeKey: 'LUA-BNG',
    stops: ['Cuanza Sul', 'Libolo', 'Gabela'],
  },
  {
    tripId: 2, // Real Express: Luanda → Huambo
    routeKey: 'LUA-HUA',
    stops: ['Cuanza Sul', 'Quibala', 'Bailundo'],
  },
  {
    tripId: 3, // Macon VIP: Benguela → Luanda
    routeKey: 'BNG-LUA',
    stops: ['Gabela', 'Libolo', 'Cuanza Sul'],
  },
  {
    tripId: 4, // Sontra: Luanda → Soyo
    routeKey: 'LUA-SOY',
    stops: [], // Rota direta, sem paragens
  },
  {
    tripId: 5, // Macon: Benguela → Huambo
    routeKey: 'BNG-HUA',
    stops: ['Ita', 'Quibala'],
  },
];

/**
 * Como usar no seed_real_angola.js:
 *
 * ✅ Opção 1: Adicionar campo 'stops' ao Trip
 *
 * const trips = [
 *   {
 *     id: 1,
 *     origin: 'Luanda',
 *     destination: 'Benguela',
 *     stops: ['Cuanza Sul', 'Libolo', 'Gabela'],  // ✨ NOVO
 *     departureTime: new Date(tomorrow + 6.5 * 3600000),
 *     ...
 *   },
 *   ...
 * ];
 *
 * ✅ Opção 2: Se quiser adicionar tabela RouteStop no Prisma
 *
 * model Trip {
 *   id Int @id @default(autoincrement())
 *   origin String
 *   destination String
 *   stops RouteStop[]  // ✨ NOVO
 * }
 *
 * model RouteStop {
 *   id Int @id @default(autoincrement())
 *   tripId Int
 *   trip Trip @relation(fields: [tripId], references: [id])
 *   stopName String
 *   order Int
 * }
 *
 * const routeStops = [];
 * ROUTE_STOPS_DATA.forEach(route => {
 *   route.stops.forEach((stopName, index) => {
 *     routeStops.push({
 *       tripId: route.tripId,
 *       stopName: stopName,
 *       order: index + 1
 *     });
 *   });
 * });
 *
 * await prisma.routeStop.createMany({ data: routeStops });
 */
