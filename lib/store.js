// Zustand store for shared state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set) => ({
            // Advanced features toggle
            advancedFeaturesEnabled: false,
            toggleAdvancedFeatures: () => set((state) => ({ advancedFeaturesEnabled: !state.advancedFeaturesEnabled })),

            // Login state
            currentUser: null,
            setCurrentUser: (user) => set({ currentUser: user }),
            clearCurrentUser: () => set({ currentUser: null }),
        }),
        {
            name: 'photo-app-storage',
            partialPersist: true,
            // Only persist advancedFeaturesEnabled, not currentUser
            partialize: (state) => ({
                advancedFeaturesEnabled: state.advancedFeaturesEnabled,
            }),
        }
    )
);

export default useStore;
