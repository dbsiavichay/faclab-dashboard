import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type { PaginatedResponse } from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export interface Stock {
    id: number
    productId: number
    quantity: number
    location?: string | null
}

export interface StockQueryParams {
    productId?: number
    limit?: number
    offset?: number
}

export const getStock = (params?: StockQueryParams) =>
    httpClient.get<PaginatedResponse<Stock>>(`${HOST}/stock`, { params })
