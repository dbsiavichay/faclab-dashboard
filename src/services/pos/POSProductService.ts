import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse } from '@/@types/api'
import type { POSProduct, ListResponse } from './POSTypes'

const HOST = appConfig.posApiHost || 'http://localhost:3000/api/pos'

export const getProducts = () =>
    httpClient.get<ListResponse<POSProduct>>(`${HOST}/products`)

export const searchProducts = (term: string, limit?: number) =>
    httpClient.get<ListResponse<POSProduct>>(`${HOST}/products/search`, {
        params: { term, limit },
    })

export const getProduct = (id: number) =>
    httpClient.get<DataResponse<POSProduct>>(`${HOST}/products/${id}`)
