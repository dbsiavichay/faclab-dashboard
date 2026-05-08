import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export type SerialStatus =
    | 'available'
    | 'reserved'
    | 'sold'
    | 'returned'
    | 'scrapped'

export const SERIAL_STATUS_LABELS: Record<SerialStatus, string> = {
    available: 'Disponible',
    reserved: 'Reservado',
    sold: 'Vendido',
    returned: 'Devuelto',
    scrapped: 'Descartado',
}

export const VALID_TRANSITIONS: Record<SerialStatus, SerialStatus[]> = {
    available: ['reserved', 'sold', 'scrapped'],
    reserved: ['scrapped'],
    sold: ['returned', 'scrapped'],
    returned: ['scrapped'],
    scrapped: [],
}

export interface SerialNumber {
    id: number
    serialNumber: string
    productId: number
    status: SerialStatus
    lotId?: number | null
    locationId?: number | null
    purchaseOrderId?: number | null
    saleId?: number | null
    notes?: string | null
    createdAt: string
    updatedAt: string
}

export interface SerialNumberInput {
    serialNumber: string
    productId: number
    lotId?: number
    notes?: string
}

export interface SerialNumberQueryParams extends PaginationParams {
    productId?: number
    status?: SerialStatus
}

export const getSerialNumbers = (params?: SerialNumberQueryParams) =>
    httpClient.get<PaginatedResponse<SerialNumber>>(`${HOST}/serials`, {
        params,
    })

export const getSerialNumber = (id: number) =>
    httpClient.get<DataResponse<SerialNumber>>(`${HOST}/serials/${id}`)

export const createSerialNumber = (serialNumber: SerialNumberInput) =>
    httpClient.post<DataResponse<SerialNumber>>(`${HOST}/serials`, serialNumber)

export const changeStatus = (id: number, status: SerialStatus) =>
    httpClient.put<DataResponse<SerialNumber>>(`${HOST}/serials/${id}/status`, {
        status,
    })
