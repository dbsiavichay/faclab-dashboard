import axios, { AxiosError } from 'axios'
import appConfig from '@/configs/app.config'
import type { ApiEnvelope, RefreshResponse } from '@/@types/auth'
import { ApiError, fromAxiosError } from '@/utils/errors/ApiError'
import tokenStorage from './tokenStorage'

let inFlight: Promise<string> | null = null

const doRefresh = async (): Promise<string> => {
    const refreshToken = tokenStorage.getRefreshToken()

    if (!refreshToken) {
        throw new ApiError({
            code: 'INVALID_TOKEN',
            message: 'Missing refresh token',
            status: 0,
        })
    }

    try {
        const response = await axios.post<ApiEnvelope<RefreshResponse>>(
            `${appConfig.authApiHost}/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
        )

        const payload = response.data.data
        tokenStorage.setTokens({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            expiresIn: payload.expiresIn,
        })
        return payload.accessToken
    } catch (err) {
        tokenStorage.clearTokens()
        throw fromAxiosError(err as AxiosError)
    }
}

export const refreshOnce = (): Promise<string> => {
    if (inFlight) return inFlight
    inFlight = doRefresh().finally(() => {
        inFlight = null
    })
    return inFlight
}

export const resetRefreshManager = (): void => {
    inFlight = null
}
