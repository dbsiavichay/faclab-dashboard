import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { useAuthStore } from '@/stores'

const instance = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
})

instance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
            config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error
        if (response && [401].includes(response.status)) {
            useAuthStore.getState().clear()
        }
        return Promise.reject(error)
    }
)

async function request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await instance.request<T>(config)
    return response.data
}

export const httpClient = {
    get<T>(
        url: string,
        config?: Omit<AxiosRequestConfig, 'url' | 'method'>
    ): Promise<T> {
        return request<T>({ ...config, url, method: 'GET' })
    },
    post<T>(
        url: string,
        data?: unknown,
        config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<T> {
        return request<T>({ ...config, url, method: 'POST', data })
    },
    patch<T>(
        url: string,
        data?: unknown,
        config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<T> {
        return request<T>({ ...config, url, method: 'PATCH', data })
    },
    put<T>(
        url: string,
        data?: unknown,
        config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<T> {
        return request<T>({ ...config, url, method: 'PUT', data })
    },
    delete<T = void>(
        url: string,
        config?: Omit<AxiosRequestConfig, 'url' | 'method'>
    ): Promise<T> {
        return request<T>({ ...config, url, method: 'DELETE' })
    },
}
