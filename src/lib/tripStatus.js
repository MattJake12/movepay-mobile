// File: src/lib/tripStatus.js

/**
 * Mapeamento de Status de Viagem
 * Sincronizado com backend enum TripStatus
 */

export const TRIP_STATUS = {
  SCHEDULED: 'SCHEDULED',    // Agendada
  BOARDING: 'BOARDING',      // Embarque Iniciado
  ON_ROUTE: 'ON_ROUTE',      // Em viagem
  COMPLETED: 'COMPLETED',    // Finalizada
  CANCELLED: 'CANCELLED'     // Cancelada
};

/**
 * Obter label amigável do status
 */
export function getTripStatusLabel(status) {
  const labels = {
    SCHEDULED: 'Agendada',
    BOARDING: 'Embarque em Progresso',
    ON_ROUTE: 'Em Viagem',
    COMPLETED: 'Finalizada',
    CANCELLED: 'Cancelada'
  };
  return labels[status] || status;
}

/**
 * Obter cores Tailwind do status
 */
export function getTripStatusColor(status) {
  const colors = {
    SCHEDULED: 'bg-blue-100',
    BOARDING: 'bg-amber-100',
    ON_ROUTE: 'bg-purple-100',
    COMPLETED: 'bg-emerald-100',
    CANCELLED: 'bg-red-100'
  };
  return colors[status] || 'bg-slate-100';
}

/**
 * Obter cor do texto do status
 */
export function getTripStatusTextColor(status) {
  const colors = {
    SCHEDULED: 'text-blue-700',
    BOARDING: 'text-amber-700',
    ON_ROUTE: 'text-purple-700',
    COMPLETED: 'text-emerald-700',
    CANCELLED: 'text-red-700'
  };
  return colors[status] || 'text-slate-700';
}

/**
 * Obter ícone/emoji do status
 */
export function getTripStatusEmoji(status) {
  const emojis = {
    SCHEDULED: '📅',
    BOARDING: '🚌',
    ON_ROUTE: '🛣️',
    COMPLETED: '✅',
    CANCELLED: '❌'
  };
  return emojis[status] || '•';
}

/**
 * Verificar se viagem pode aceitar novas reservas
 */
export function canBookTrip(status) {
  return status === TRIP_STATUS.SCHEDULED || status === TRIP_STATUS.BOARDING;
}

/**
 * Verificar se viagem está ativa (em progresso)
 */
export function isTripActive(status) {
  return status === TRIP_STATUS.ON_ROUTE || status === TRIP_STATUS.BOARDING;
}

/**
 * Verificar se viagem terminou
 */
export function isTripFinished(status) {
  return status === TRIP_STATUS.COMPLETED || status === TRIP_STATUS.CANCELLED;
}

export default {
  TRIP_STATUS,
  getTripStatusLabel,
  getTripStatusColor,
  getTripStatusTextColor,
  getTripStatusEmoji,
  canBookTrip,
  isTripActive,
  isTripFinished
};
