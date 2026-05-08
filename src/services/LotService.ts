import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export interface Lot {
    id: number
    lotNumber: string
    productId: number
    initialQuantity: number
    currentQuantity: number
    manufactureDate?: string | null
    expirationDate?: string | null
    isExpired: boolean
    daysToExpiry?: number | null
    notes?: string | null
    createdAt: string
    updatedAt: string
}

export interface LotInput {
    lotNumber: string
    productId: number
    initialQuantity: number
    manufactureDate?: string
    expirationDate?: string
    notes?: string
}

export interface LotUpdateInput {
    currentQuantity?: number
    manufactureDate?: string
    expirationDate?: string
    notes?: string
}

export interface LotQueryParams extends PaginationParams {
    productId?: number
    expiringInDays?: number
}

export const getLots = (params?: LotQueryParams) =>
    httpClient.get<PaginatedResponse<Lot>>(`${HOST}/lots`, { params })

export const getLot = (id: number) =>
    httpClient.get<DataResponse<Lot>>(`${HOST}/lots/${id}`)

export const createLot = (lot: LotInput) =>
    httpClient.post<DataResponse<Lot>>(`${HOST}/lots`, lot)

export const updateLot = (id: number, lot: LotUpdateInput) =>
    httpClient.put<DataResponse<Lot>>(`${HOST}/lots/${id}`, lot)
