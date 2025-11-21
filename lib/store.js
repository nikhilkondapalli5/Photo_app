// Zustand store for shared state
import { create } from 'zustand';

export const useStore = create((set) => ({
    // Advanced features toggle
    advancedFeaturesEnabled: false,
    toggleAdvancedFeatures: () =>
        set((state) => ({ advancedFeaturesEnabled: !state.advancedFeaturesEnabled })),

    // Login state
    currentUser: null,
    setCurrentUser: (user) => set({ currentUser: user }),
    clearCurrentUser: () => set({ currentUser: null }),
}));
