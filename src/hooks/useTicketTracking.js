// File: src/hooks/useTicket

import { useState, useEffect } from 'react';

/**
 * Hook para rastrear o progresso de uma viagem
 * Calcula ETA, status e progresso visual
 */
export function useTicketTracking(ticket) {
  const [tracking, setTracking] = useState({
    progress: 0, // 0-1 (para Progress Bar)
    status: 'AGENDADO', // AGENDADO, AGUARDANDO_PARTIDA, EM_TRÂNSITO, CHEGOU
    statusLabel: 'Agendado',
    eta: '', // Tempo faltante
    elapsedTime: '', // Tempo decorrido
    remainingTime: '', // Tempo restante
    elapsedPercentage: 0 // Para barra visual
  });

  useEffect(() => {
    if (!ticket?.trip) return;

    const updateTracking = () => {
      const now = new Date().getTime();
      const start = new Date(ticket.trip.departureTime).getTime();
      const end = new Date(ticket.trip.arrivalTime).getTime();
      const totalDuration = end - start;
      const elapsed = Math.max(0, now - start);
      const remaining = Math.max(0, end - now);

      let progress = 0;
      let status = 'AGENDADO';
      let statusLabel = 'Agendado';
      let eta = '';
      let elapsedTime = '';
      let remainingTime = '';
      let elapsedPercentage = 0;

      if (now < start) {
        // ⏰ Aguardando Partida
        progress = 0;
        status = 'AGUARDANDO_PARTIDA';
        statusLabel = 'Aguardando Partida';

        const diffMs = start - now;
        const diffHrs = Math.floor(diffMs / (1000 * 3600));
        const diffMins = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));

        if (diffHrs > 0) {
          eta = `Sai em ${diffHrs}h ${diffMins}m`;
        } else {
          eta = `Sai em ${diffMins}m`;
        }
        elapsedTime = 'Ainda não saiu';
        remainingTime = eta;
      } else if (now >= start && now <= end) {
        // 🚌 Em Trânsito
        progress = elapsed / totalDuration;
        elapsedPercentage = Math.round(progress * 100);
        status = 'EM_TRÂNSITO';
        statusLabel = 'Em Trânsito';

        // Tempo decorrido
        const elapsedHrs = Math.floor(elapsed / (1000 * 3600));
        const elapsedMins = Math.floor((elapsed % (1000 * 3600)) / (1000 * 60));
        elapsedTime = `${elapsedHrs}h ${elapsedMins}m`;

        // Tempo restante
        const remHrs = Math.floor(remaining / (1000 * 3600));
        const remMins = Math.floor((remaining % (1000 * 3600)) / (1000 * 60));
        remainingTime = `${remHrs}h ${remMins}m`;

        eta = `Chega em ${new Date(end).toLocaleTimeString('pt-PT', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      } else {
        // ✅ Chegou ao Destino
        progress = 1;
        elapsedPercentage = 100;
        status = 'CHEGOU';
        statusLabel = 'Chegou ao Destino';
        eta = 'Viagem finalizada';
        elapsedTime = `${Math.floor(totalDuration / (1000 * 3600))}h de viagem`;
        remainingTime = '0m';
      }

      setTracking({
        progress,
        status,
        statusLabel,
        eta,
        elapsedTime,
        remainingTime,
        elapsedPercentage
      });
    };

    updateTracking();
    // Atualizar a cada 30 segundos (menos pesado que a cada minuto)
    const interval = setInterval(updateTracking, 30000);

    return () => clearInterval(interval);
  }, [ticket]);

  return tracking;
}
