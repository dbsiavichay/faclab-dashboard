import { create } from 'zustand'

interface BaseState {
    // State
    currentRouteKey: string

    // Actions
    setCurrentRouteKey: (key: string) => void
}

export const useBaseStore = create<BaseState>()((set) => ({
    // Initial state
    currentRouteKey: '',

    // Actions
    setCurrentRouteKey: (currentRouteKey) => set({ currentRouteKey }),
}))
