import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CoordinatePreset } from '@/types';

export interface FavoritesStore {
  coordinates: CoordinatePreset[];
  addCoordinate: (coord: CoordinatePreset) => void;
  removeCoordinate: (id: string) => void;
  updateCoordinate: (coord: CoordinatePreset) => void;
  loadCoordinate: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      coordinates: [],
      addCoordinate: (coord) =>
        set((state) => ({
          coordinates: [coord, ...state.coordinates],
        })),
      removeCoordinate: (id) =>
        set((state) => ({
          coordinates: state.coordinates.filter((c) => c.id !== id),
        })),
      updateCoordinate: (coord) =>
        set((state) => ({
          coordinates: state.coordinates.map((c) => (c.id === coord.id ? coord : c)),
        })),
      loadCoordinate: (id) => {
        // Intentionally empty or handle side-effects if needed
      },
    }),
    {
      name: 'inkclo-coordinates',
    }
  )
);
