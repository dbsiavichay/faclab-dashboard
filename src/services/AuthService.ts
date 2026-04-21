import { authRequest } from './AuthApiClient'
import appConfig from '@/configs/app.config'
import type {
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MeResponse,
    RefreshRequest,
    RefreshResponse,
} from '@/@types/auth'

const AUTH = appConfig.authApiHost

export const apiLogin = (body: LoginRequest): Promise<LoginResponse> =>
    authRequest<LoginResponse>({
        url: `${AUTH}/login`,
        method: 'POST',
        data: body,
    })

export const apiRefresh = (body: RefreshRequest): Promise<RefreshResponse> =>
    authRequest<RefreshResponse>({
        url: `${AUTH}/refresh`,
        method: 'POST',
        data: body,
    })

export const apiMe = (): Promise<MeResponse> =>
    authRequest<MeResponse>({
        url: `${AUTH}/me`,
        method: 'GET',
    })

export const apiChangePassword = (body: ChangePasswordRequest): Promise<void> =>
    authRequest<void>({
        url: `${AUTH}/change-password`,
        method: 'POST',
        data: body,
    })

type DeprecatedAuthResponse = { data: { token: string; user: unknown } | null }

/** @deprecated Removed in Etapa 4. Only kept so legacy forms still compile. */
export const apiSignUp = async (
    _payload?: unknown
): Promise<DeprecatedAuthResponse> => {
    throw new Error('Sign up deshabilitado')
}

/** @deprecated Removed in Etapa 4. */
export const apiForgotPassword = async (
    _payload?: unknown
): Promise<DeprecatedAuthResponse> => {
    throw new Error('Recuperación de contraseña deshabilitada')
}

/** @deprecated Removed in Etapa 4. */
export const apiResetPassword = async (
    _payload?: unknown
): Promise<DeprecatedAuthResponse> => {
    throw new Error('Reset de contraseña deshabilitado')
}
