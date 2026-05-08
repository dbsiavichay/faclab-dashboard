import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export interface Warehouse {
    id: number
    name: string
    code: string
    address?: string | null
    city?: string | null
    country?: string | null
    isActive: boolean
    isDefault: boolean
    manager?: string | null
    phone?: string | null
    email?: string | null
}

export interface WarehouseInput {
    name: string
    code: string
    address?: string | null
    city?: string | null
    country?: string | null
    isActive?: boolean
    isDefault?: boolean
    manager?: string | null
    phone?: string | null
    email?: string | null
    [key: string]: unknown
}

export interface WarehouseQueryParams extends PaginationParams {
    isActive?: boolean
}

export const getWarehouses = (params?: WarehouseQueryParams) =>
    httpClient.get<PaginatedResponse<Warehouse>>(`${HOST}/warehouses`, {
        params,
    })

export const getWarehouseById = (id: number) =>
    httpClient.get<DataResponse<Warehouse>>(`${HOST}/warehouses/${id}`)

export const createWarehouse = (data: WarehouseInput) =>
    httpClient.post<DataResponse<Warehouse>>(`${HOST}/warehouses`, data)

export const updateWarehouse = (id: number, data: Partial<WarehouseInput>) =>
    httpClient.put<DataResponse<Warehouse>>(`${HOST}/warehouses/${id}`, data)

export const deleteWarehouse = (id: number) =>
    httpClient.delete(`${HOST}/warehouses/${id}`)
