// File: src/hooks/useTickets.js

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useUserTicketsQuery() {
  return useQuery({
    queryKey: ['userTickets'],
    queryFn: () => api.getUserTickets(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTicketDetailsQuery(ticketId) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => api.getTicketDetails(ticketId),
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 5,
  });
}
