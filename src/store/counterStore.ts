import { create } from "zustand";

// Tiny Zustand store used by the watch-expression demo and a few effect bugs.
// Kept separate from userStore so FloTrace shows two independent slice trees.

interface CounterState {
  count: number;
  history: number[];
  meta: { lastUpdatedAt: number; bumps: number };
  increment: () => void;
  bump: (by: number) => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  history: [],
  meta: { lastUpdatedAt: 0, bumps: 0 },
  increment: () =>
    set((s) => ({
      count: s.count + 1,
      history: [...s.history.slice(-9), s.count + 1],
      meta: { lastUpdatedAt: Date.now(), bumps: s.meta.bumps + 1 },
    })),
  bump: (by) =>
    set((s) => ({
      count: s.count + by,
      history: [...s.history.slice(-9), s.count + by],
      meta: { lastUpdatedAt: Date.now(), bumps: s.meta.bumps + 1 },
    })),
  reset: () =>
    set({
      count: 0,
      history: [],
      meta: { lastUpdatedAt: Date.now(), bumps: 0 },
    }),
}));
