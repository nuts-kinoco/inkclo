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
}));
