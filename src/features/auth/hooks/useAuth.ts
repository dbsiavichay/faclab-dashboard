import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiChangePassword, apiLogin, apiMe, apiRefresh } from '../api/client'
import { navigateTo } from '@shared/lib/auth/navigationRef'
import appConfig from '@/configs/app.config'
import tokenStorage from '@shared/lib/auth/tokenStorage'
import { refreshScheduler } from '@shared/lib/auth/refreshScheduler'
import type {
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MeResponse,
} from '@/@types/auth'

export const ME_QUERY_KEY = ['auth', 'me'] as const

export function useMe() {
    const accessToken = useAuthStore((s) => s.accessToken)
    const setSession = useAuthStore((s) => s.setSession)
    const setTokens = useAuthStore((s) => s.setTokens)
    const clear = useAuthStore((s) => s.clear)

    return useQuery<MeResponse>({
        queryKey: ME_QUERY_KEY,
        queryFn: async () => {
            try {
                const expiresAt = tokenStorage.getAccessExpiresAt()
                if (expiresAt && expiresAt < Date.now()) {
                    const rt = useAuthStore.getState().refreshToken
                    if (rt) {
                        const newTokens = await apiRefresh({ refreshToken: rt })
                        setTokens(newTokens)
                        refreshScheduler.start(newTokens.expiresIn)
                    }
                }
                const session = await apiMe()
                setSession(session)
                return session
            } catch (err) {
                clear()
                throw err
            }
        },
        enabled: !!accessToken,
        staleTime: 5 * 60 * 1000,
        retry: false,
    })
}

export function useLogin() {
    const qc = useQueryClient()
    const setTokens = useAuthStore((s) => s.setTokens)
    const setSession = useAuthStore((s) => s.setSession)

    return useMutation<LoginResponse, unknown, LoginRequest>({
        mutationFn: (body) => apiLogin(body),
        onSuccess: async (tokens) => {
            setTokens(tokens)
            refreshScheduler.start(tokens.expiresIn)
            const session = await qc.fetchQuery({
                queryKey: ME_QUERY_KEY,
                queryFn: apiMe,
            })
            setSession(session)
        },
    })
}

export function useChangePassword() {
    const qc = useQueryClient()
    const setTokens = useAuthStore((s) => s.setTokens)
    const setSession = useAuthStore((s) => s.setSession)

    return useMutation<void, unknown, ChangePasswordRequest>({
        mutationFn: (body) => apiChangePassword(body),
        onSuccess: async () => {
            const rt = useAuthStore.getState().refreshToken
            if (rt) {
                const newTokens = await apiRefresh({ refreshToken: rt })
                setTokens(newTokens)
                refreshScheduler.start(newTokens.expiresIn)
            }
            const session = await qc.fetchQuery({
                queryKey: ME_QUERY_KEY,
                queryFn: apiMe,
            })
            setSession(session)
        },
    })
}

export function useLogout() {
    const qc = useQueryClient()
    const clear = useAuthStore((s) => s.clear)

    return useMutation<void, unknown, void>({
        mutationFn: async () => {
            /* El backend no define logout server-side. */
        },
        onSuccess: () => {
            refreshScheduler.stop()
            clear()
            qc.clear()
            navigateTo(appConfig.unAuthenticatedEntryPath, { replace: true })
        },
    })
}
