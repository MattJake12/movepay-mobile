// File: src/hooks/useBooking.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useCartStore } from '../store/useCartStore';

export function useBooking() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);
  const snacks = useCartStore((state) => state.snacks);
  const deliveryMethod = useCartStore((state) => state.deliveryMethod); // 🆕 Pegar método de entrega

  // Criação de Reserva (Ticket)
  const createBookingMutation = useMutation({
    mutationFn: async ({ tripId, selectedSeats, paymentMethod }) => {
      // Cria um mapping de assentos → lanches
      // Se tiver 3 assentos e 2 lanches:
      // Assento 1 → Lanche 1
      // Assento 2 → Lanche 2
      // Assento 3 → Nenhum lanche
      
      const promises = selectedSeats.map((seatNum, index) => {
        const bookingData = {
          tripId,
          seatNumber: seatNum,
          paymentMethod,
          // 🆕 Incluir método de entrega selecionado
          deliveryMethod: snacks[index] ? deliveryMethod : undefined, // Só envia se tem lanche
        };

        // Associa lanche se houver um disponível para este assento
        if (snacks[index]) {
          bookingData.snackId = snacks[index].id;
        }

        return api.post('/bookings', bookingData);
      });

      const responses = await Promise.all(promises);
      return responses.map(r => r.data.data);
    },
    onSuccess: () => {
      // 1. Limpa o carrinho
      clearCart();
      // 2. Invalida cache de "Minhas Viagens" para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['trip-details'] }); // Atualiza assentos ocupados
    }
  });

  return {
    createBooking: createBookingMutation
  };
}