const ACCESS_KEY = 'fc.access'
const REFRESH_KEY = 'fc.refresh'
const EXPIRES_AT_KEY = 'fc.accessExpiresAt'

type TokenPayload = {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

const safeGet = (key: string): string | null => {
    try {
        return typeof window === 'undefined'
            ? null
            : window.localStorage.getItem(key)
    } catch {
        return null
    }
}

const safeSet = (key: string, value: string): void => {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value)
        }
    } catch {
        /* ignore */
    }
}

const safeRemove = (key: string): void => {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key)
        }
    } catch {
        /* ignore */
    }
}

export const tokenStorage = {
    getAccessToken(): string | null {
        return safeGet(ACCESS_KEY)
    },
    getRefreshToken(): string | null {
        return safeGet(REFRESH_KEY)
    },
    getAccessExpiresAt(): number | null {
        const raw = safeGet(EXPIRES_AT_KEY)
        if (!raw) return null
        const parsed = Number(raw)
        return Number.isFinite(parsed) ? parsed : null
    },
    setTokens({ accessToken, refreshToken, expiresIn }: TokenPayload): void {
        safeSet(ACCESS_KEY, accessToken)
        safeSet(REFRESH_KEY, refreshToken)
        safeSet(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000))
    },
    clearTokens(): void {
        safeRemove(ACCESS_KEY)
        safeRemove(REFRESH_KEY)
        safeRemove(EXPIRES_AT_KEY)
    },
}

export default tokenStorage
