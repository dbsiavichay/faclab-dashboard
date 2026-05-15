import { authRequest } from '@shared/lib/http/authClient'
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
