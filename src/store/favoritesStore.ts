import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CoordinatePreset } from '@/types';

interface FavoritesState {
  favorites: CoordinatePreset[];
  addFavorite: (preset: CoordinatePreset) => void;
  removeFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (preset) =>
        set((state) => ({
          favorites: [preset, ...state.favorites],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),
    }),
    {
      name: 'inclo-favorites', // LocalStorage key
    }
  )
);
