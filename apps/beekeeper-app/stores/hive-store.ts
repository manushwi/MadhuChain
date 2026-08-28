import { create } from 'zustand';
import type { Hive } from '@/lib/types';

interface HiveState {
  hives: Hive[];
  setHives: (h: Hive[]) => void;
  upsert: (h: Hive) => void;
}

export const useHiveStore = create<HiveState>((set) => ({
  hives: [],
  setHives: (hives) => set({ hives }),
  upsert: (hive) =>
    set((s) => {
      const idx = s.hives.findIndex((h) => h.id === hive.id);
      const hives = [...s.hives];
      if (idx >= 0) hives[idx] = hive;
      else hives.push(hive);
      return { hives };
    }),
}));
