import BaseService from '@/services/BaseService'
import type { AxiosRequestConfig } from 'axios'

async function request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await BaseService.request<T>(config)
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
