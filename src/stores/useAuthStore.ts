import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
    avatar?: string
    userName?: string
    email?: string
    authority?: string[]
}

interface AuthState {
    // State
    user: User | null
    token: string | null
    signedIn: boolean

    // Actions
    signInSuccess: (token: string, user: User) => void
    signOutSuccess: () => void
    setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Initial state
            user: null,
            token: null,
            signedIn: false,

            // Actions
            signInSuccess: (token, user) =>
                set({
                    token,
                    user,
                    signedIn: true,
                }),

            signOutSuccess: () =>
                set({
                    user: null,
                    token: null,
                    signedIn: false,
                }),

            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
        }
    )
)
