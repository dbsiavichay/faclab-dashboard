import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

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

class SerialNumberService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getSerialNumbers(params?: SerialNumberQueryParams) {
        const queryParams = new URLSearchParams()

        if (params?.productId) {
            queryParams.append('productId', params.productId.toString())
        }
        if (params?.status) {
            queryParams.append('status', params.status)
        }
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }

        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/serials?${queryString}`
            : `${this.config.host}/serials`

        return ApiService.fetchData<PaginatedResponse<SerialNumber>>({
            url,
            method: 'get',
        })
    }

    async getSerialNumber(id: number) {
        return ApiService.fetchData<DataResponse<SerialNumber>>({
            url: `${this.config.host}/serials/${id}`,
            method: 'get',
        })
    }

    async createSerialNumber(serialNumber: SerialNumberInput) {
        return ApiService.fetchData<DataResponse<SerialNumber>>({
            url: `${this.config.host}/serials`,
            method: 'post',
            data: serialNumber,
        })
    }

    async changeStatus(id: number, status: SerialStatus) {
        return ApiService.fetchData<DataResponse<SerialNumber>>({
            url: `${this.config.host}/serials/${id}/status`,
            method: 'put',
            data: { status },
        })
    }
}

export default new SerialNumberService()
