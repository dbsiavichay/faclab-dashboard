import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

export type SerialStatus =
    | 'AVAILABLE'
    | 'RESERVED'
    | 'SOLD'
    | 'IN_TRANSIT'
    | 'DEFECTIVE'
    | 'RETURNED'

export const SERIAL_STATUS_LABELS: Record<SerialStatus, string> = {
    AVAILABLE: 'Disponible',
    RESERVED: 'Reservado',
    SOLD: 'Vendido',
    IN_TRANSIT: 'En Tránsito',
    DEFECTIVE: 'Defectuoso',
    RETURNED: 'Devuelto',
}

export interface SerialNumber {
    id: number
    serialNumber: string
    productId: number
    status: SerialStatus
    lotId?: number | null
    locationId?: number | null
    notes?: string | null
    createdAt: string
    updatedAt: string
}

export interface SerialNumberInput {
    serialNumber: string
    productId: number
    status?: SerialStatus
    lotId?: number
    locationId?: number
    notes?: string
}

export interface SerialNumberQueryParams {
    productId?: number
    status?: SerialStatus
    lotId?: number
    locationId?: number
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
        if (params?.lotId) {
            queryParams.append('lotId', params.lotId.toString())
        }
        if (params?.locationId) {
            queryParams.append('locationId', params.locationId.toString())
        }

        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/serials?${queryString}`
            : `${this.config.host}/serials`

        return ApiService.fetchData<SerialNumber[]>({
            url,
            method: 'get',
        })
    }

    async getSerialNumber(id: number) {
        return ApiService.fetchData<SerialNumber>({
            url: `${this.config.host}/serials/${id}`,
            method: 'get',
        })
    }

    async createSerialNumber(serialNumber: SerialNumberInput) {
        return ApiService.fetchData<SerialNumber>({
            url: `${this.config.host}/serials`,
            method: 'post',
            data: serialNumber,
        })
    }

    async updateSerialNumber(id: number, serialNumber: SerialNumberInput) {
        return ApiService.fetchData<SerialNumber>({
            url: `${this.config.host}/serials/${id}`,
            method: 'put',
            data: serialNumber,
        })
    }

    async deleteSerialNumber(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/serials/${id}`,
            method: 'delete',
        })
    }

    async changeStatus(id: number, status: SerialStatus) {
        return ApiService.fetchData<SerialNumber>({
            url: `${this.config.host}/serials/${id}/status`,
            method: 'put',
            data: { status },
        })
    }
}

export default new SerialNumberService()
