import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MIN_SIZE = 10;
const MAX_SIZE = 20;
const DEFAULT_SIZE = 14;
const CSS_VAR = '--font-size-base';

function applyFontSize(size: number) {
  document.documentElement.style.setProperty(CSS_VAR, `${size}px`);
}

export const useFontSize = create<FontSizeStore>()(
  persist(
    (set, get) => ({
      fontSize: DEFAULT_SIZE,
      increase: () => {
        const next = Math.min(get().fontSize + 1, MAX_SIZE);
        set({ fontSize: next });
        applyFontSize(next);
      },
      decrease: () => {
        const next = Math.max(get().fontSize - 1, MIN_SIZE);
        set({ fontSize: next });
        applyFontSize(next);
      },
    }),
    {
      name: 'font-size-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyFontSize(state.fontSize);
      },
    },
  ),
);

interface FontSizeStore {
  fontSize: number;
  increase: () => void;
  decrease: () => void;
}
