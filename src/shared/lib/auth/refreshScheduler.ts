import { apiRefresh } from '@/services/AuthService'
import { useAuthStore } from '@/stores/useAuthStore'

let timer: ReturnType<typeof setTimeout> | null = null

export const refreshScheduler = {
    start(expiresIn: number): void {
        if (timer) clearTimeout(timer)
        const delay = Math.max(0, (expiresIn - 60) * 1000)
        timer = setTimeout(async () => {
            timer = null
            const rt = useAuthStore.getState().refreshToken
            if (!rt) return
            try {
                const newTokens = await apiRefresh({ refreshToken: rt })
                useAuthStore.getState().setTokens(newTokens)
                refreshScheduler.start(newTokens.expiresIn)
            } catch {
                /* reactive interceptor handles TOKEN_EXPIRED as fallback */
            }
        }, delay)
    },

    stop(): void {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    },

    _isRunning(): boolean {
        return timer !== null
    },
}
