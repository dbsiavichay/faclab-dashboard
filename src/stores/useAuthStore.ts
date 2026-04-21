import { create } from 'zustand'
import type { Session } from '@/@types/auth'
import type { Permission } from '@/constants/permissions.constant'
import type { RoleCode } from '@/constants/roles.constant'
import tokenStorage from '@/services/tokenStorage'
import { resetRefreshManager } from '@/services/refreshManager'

type SetTokensPayload = {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

interface AuthState {
    accessToken: string | null
    refreshToken: string | null
    accessExpiresAt: number | null
    session: Session | null

    setTokens: (payload: SetTokensPayload) => void
    setSession: (session: Session | null) => void
    clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: tokenStorage.getAccessToken(),
    refreshToken: tokenStorage.getRefreshToken(),
    accessExpiresAt: tokenStorage.getAccessExpiresAt(),
    session: null,

    setTokens: (payload) => {
        tokenStorage.setTokens(payload)
        set({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            accessExpiresAt: Date.now() + payload.expiresIn * 1000,
        })
    },

    setSession: (session) => set({ session }),

    clear: () => {
        tokenStorage.clearTokens()
        resetRefreshManager()
        set({
            accessToken: null,
            refreshToken: null,
            accessExpiresAt: null,
            session: null,
        })
    },
}))

export const useAccessToken = (): string | null =>
    useAuthStore((s) => s.accessToken)

export const useSession = (): Session | null => useAuthStore((s) => s.session)

export const useIsAuthenticated = (): boolean =>
    useAuthStore((s) => !!s.accessToken && !!s.session)

export const useCan = (permission: Permission): boolean =>
    useAuthStore((s) => s.session?.permissions.includes(permission) ?? false)

export const useHasRole = (...roles: RoleCode[]): boolean =>
    useAuthStore((s) => (s.session ? roles.includes(s.session.role) : false))
