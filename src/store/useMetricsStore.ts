import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MetricEntry {
  id: string;
  timestamp: number;
  weight: number;
  bodyFat: number;
  skeletalMuscle: number;
  bmi: number;
  restingMetabolism: number;
  bodyAge: number;
  visceralFat: number;
}

interface MetricsState {
  entries: MetricEntry[];
  addEntry: (entry: Omit<MetricEntry, 'id' | 'timestamp'>) => void;
  deleteEntry: (id: string) => void;
}

export const useMetricsStore = create<MetricsState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (data) =>
        set((state) => ({
          entries: [
            {
              ...data,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
            ...state.entries,
          ].sort((a, b) => b.timestamp - a.timestamp),
        })),
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),
    }),
    {
      name: 'omron-metrics-storage',
    }
  )
);
