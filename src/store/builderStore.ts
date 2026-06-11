import { create } from 'zustand';
import { Coordinate, GearCategory, Gear } from '@/types';

interface BuilderState {
  coordinate: Coordinate;
  setGear: (category: GearCategory, gearId: string) => void;
  removeGear: (category: GearCategory) => void;
  clearCoordinate: () => void;
  setCoordinate: (coord: Coordinate) => void;
  selectedGearForDetail: Gear | null;
  openGearDetail: (gear: Gear) => void;
  closeGearDetail: () => void;
  
  // Scoring state
  seasonOverride: 'spring' | 'summer' | 'autumn' | 'winter' | null;
  setSeasonOverride: (season: 'spring' | 'summer' | 'autumn' | 'winter' | null) => void;
  isComparisonOpen: boolean;
  setComparisonOpen: (open: boolean) => void;
  comparisonCategory: GearCategory | null;
  setComparisonCategory: (category: GearCategory | null) => void;

  // Weapon state
  weaponId: string | null;
  setWeaponId: (weaponId: string | null) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  coordinate: {},
  setGear: (category, gearId) =>
    set((state) => ({
      coordinate: {
        ...state.coordinate,
        [`${category}Id`]: gearId,
      },
    })),
  removeGear: (category) =>
    set((state) => {
      const newCoord = { ...state.coordinate };
      delete newCoord[`${category}Id` as keyof Coordinate];
      return { coordinate: newCoord };
    }),
  clearCoordinate: () => set({ coordinate: {} }),
  setCoordinate: (coord) => set({ coordinate: coord }),
  selectedGearForDetail: null,
  openGearDetail: (gear) => set({ selectedGearForDetail: gear }),
  closeGearDetail: () => set({ selectedGearForDetail: null }),

  seasonOverride: null,
  setSeasonOverride: (season) => set({ seasonOverride: season }),
  isComparisonOpen: false,
  setComparisonOpen: (open) => set({ isComparisonOpen: open }),
  comparisonCategory: null,
  setComparisonCategory: (category) => set({ comparisonCategory: category }),

  weaponId: null,
  setWeaponId: (id) => set({ weaponId: id }),
}));
