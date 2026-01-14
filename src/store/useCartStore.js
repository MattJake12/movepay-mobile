// File: src/store/useCartStore.js

import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  // Estado Inicial
  trip: null,          // A viagem selecionada (Objeto completo)
  selectedSeats: [],   // Array de números [12, 13]
  snacks: [],          // Array de lanches selecionados
  
  // 🆕 Método de entrega de lanches (Padrão: Retirar no Balcão - mais seguro)
  deliveryMethod: 'PICKUP_COUNTER', // 'PICKUP_COUNTER' | 'SEAT_DELIVERY'
  
  // Actions (Ações)
  setTrip: (trip) => set({ trip, selectedSeats: [], snacks: [], deliveryMethod: 'PICKUP_COUNTER' }),
  
  toggleSeat: (seatNumber) => set((state) => {
    const exists = state.selectedSeats.includes(seatNumber);
    if (exists) {
      return { selectedSeats: state.selectedSeats.filter(s => s !== seatNumber) };
    } else {
      // Regra de Negócio: Máximo 5 assentos
      if (state.selectedSeats.length >= 5) return state;
      return { selectedSeats: [...state.selectedSeats, seatNumber] };
    }
  }),

  addSnack: (snack) => set((state) => ({ snacks: [...state.snacks, snack] })),
  
  removeSnack: (snackId) => set((state) => ({ 
    snacks: state.snacks.filter(s => s.id !== snackId) 
  })),

  // 🆕 Definir método de entrega
  setDeliveryMethod: (method) => set({ 
    deliveryMethod: ['PICKUP_COUNTER', 'SEAT_DELIVERY'].includes(method) ? method : 'PICKUP_COUNTER'
  }),

  clearCart: () => set({ trip: null, selectedSeats: [], snacks: [], deliveryMethod: 'PICKUP_COUNTER' }),

  // Computed (Calculadora)
  getTotal: () => {
    const state = get();
    if (!state.trip) return 0;

    const seatsTotal = state.selectedSeats.length * Number(state.trip.price);
    const snacksTotal = state.snacks.reduce((acc, item) => acc + Number(item.price), 0);

    return seatsTotal + snacksTotal;
  }
}));