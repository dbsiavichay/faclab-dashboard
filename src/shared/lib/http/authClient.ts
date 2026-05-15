import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { ApiError, fromAxiosError, isApiError } from '@/utils/errors/ApiError'
import { navigateTo } from '@shared/lib/auth/navigationRef'
import { refreshOnce } from '@shared/lib/auth/refreshManager'
import tokenStorage from '@shared/lib/auth/tokenStorage'

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

const SIGN_IN_PATH = appConfig.unAuthenticatedEntryPath
const CHANGE_PASSWORD_PATH = '/change-password'

const isRefreshRequest = (config?: AxiosRequestConfig): boolean => {
    const url = config?.url ?? ''
    return url.includes('/auth/refresh')
}

const forceSignOut = (): void => {
    tokenStorage.clearTokens()
    navigateTo(SIGN_IN_PATH, { replace: true })
}

const AuthApiClient = axios.create({
    baseURL: appConfig.apiBaseUrl,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
})

AuthApiClient.interceptors.request.use((config) => {
    const token = tokenStorage.getAccessToken()
    if (token) {
        config.headers.set(REQUEST_HEADER_AUTH_KEY, `${TOKEN_TYPE}${token}`)
    }
    return config
})

AuthApiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 204) return response

        const body = response.data
        if (body && typeof body === 'object' && 'data' in body) {
            const meta = (body as { meta?: { pagination?: unknown } }).meta
            if (meta?.pagination) {
                ;(
                    response as AxiosResponse & { _pagination?: unknown }
                )._pagination = meta.pagination
            }
            response.data = (body as { data: unknown }).data
        }
        return response
    },
    async (error: AxiosError) => {
        const apiError = fromAxiosError(error)
        const originalConfig = error.config as RetriableConfig | undefined

        if (isRefreshRequest(originalConfig)) {
            forceSignOut()
            return Promise.reject(apiError)
        }

        switch (apiError.code) {
            case 'TOKEN_EXPIRED': {
                if (!originalConfig || originalConfig._retried) {
                    forceSignOut()
                    return Promise.reject(apiError)
                }
                try {
                    const newAccessToken = await refreshOnce()
                    originalConfig._retried = true
                    originalConfig.headers.set(
                        REQUEST_HEADER_AUTH_KEY,
                        `${TOKEN_TYPE}${newAccessToken}`
                    )
                    return AuthApiClient.request(originalConfig)
                } catch (refreshErr) {
                    forceSignOut()
                    return Promise.reject(
                        isApiError(refreshErr) ? refreshErr : apiError
                    )
                }
            }
            case 'INVALID_TOKEN':
                forceSignOut()
                return Promise.reject(apiError)
            case 'PERMISSION_DENIED':
                if (!tokenStorage.getAccessToken()) {
                    forceSignOut()
                }
                return Promise.reject(apiError)
            case 'PASSWORD_CHANGE_REQUIRED':
                navigateTo(CHANGE_PASSWORD_PATH, { replace: true })
                return Promise.reject(apiError)
            default:
                return Promise.reject(apiError)
        }
    }
)

export const authRequest = async <T>(
    config: AxiosRequestConfig
): Promise<T> => {
    const response = await AuthApiClient.request<T>(config)
    return response.data as T
}

export const authRequestPaginated = async <T>(
    config: AxiosRequestConfig
): Promise<{ data: T[]; total: number }> => {
    type WithPagination = AxiosResponse & { _pagination?: { total: number } }
    const response = (await AuthApiClient.request<T[]>(
        config
    )) as WithPagination
    return {
        data: response.data as T[],
        total: response._pagination?.total ?? 0,
    }
}

export { ApiError, isApiError }
export default AuthApiClient
