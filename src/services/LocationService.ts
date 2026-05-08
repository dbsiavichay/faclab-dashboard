import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export type LocationType = 'STORAGE' | 'RECEIVING' | 'SHIPPING' | 'RETURN'

export interface Location {
    id: number
    warehouseId: number
    name: string
    code: string
    type: LocationType
    isActive: boolean
    capacity?: number | null
}

export interface LocationInput {
    warehouseId: number
    name: string
    code: string
    type: LocationType
    isActive?: boolean
    capacity?: number | null
    [key: string]: unknown
}

export interface LocationQueryParams extends PaginationParams {
    warehouseId?: number
    isActive?: boolean
}

export const getLocations = (params?: LocationQueryParams) =>
    httpClient.get<PaginatedResponse<Location>>(`${HOST}/locations`, { params })

export const getLocationById = (id: number) =>
    httpClient.get<DataResponse<Location>>(`${HOST}/locations/${id}`)

export const createLocation = (data: LocationInput) =>
    httpClient.post<DataResponse<Location>>(`${HOST}/locations`, data)

export const updateLocation = (id: number, data: Partial<LocationInput>) =>
    httpClient.put<DataResponse<Location>>(`${HOST}/locations/${id}`, data)

export const deleteLocation = (id: number) =>
    httpClient.delete(`${HOST}/locations/${id}`)
