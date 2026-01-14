
import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  timeOfDay: [],
  busClass: 'ALL',
  companies: [],
  minRating: 0,
  maxDuration: null,
  minPrice: 0,
  maxPrice: 1000000, // Valor alto como teto inicial

  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  clearFilters: () => set({ 
    timeOfDay: [], 
    busClass: 'ALL', 
    companies: [], 
    minRating: 0, 
    maxDuration: null,
    minPrice: 0,
    maxPrice: 1000000
  }),
}));
