import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export type TransferStatus = 'draft' | 'confirmed' | 'received' | 'cancelled'

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
    draft: 'Borrador',
    confirmed: 'Confirmado',
    received: 'Recibido',
    cancelled: 'Cancelado',
}

export const TRANSFER_STATUS_CLASSES: Record<TransferStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    confirmed:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    received:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export interface Transfer {
    id: number
    sourceLocationId: number
    destinationLocationId: number
    status: TransferStatus
    transferDate: string | null
    requestedBy: string | null
    notes: string | null
    createdAt: string | null
}

export interface TransferInput {
    sourceLocationId: number
    destinationLocationId: number
    notes?: string | null
    requestedBy?: string | null
}

export interface TransferUpdateInput {
    notes?: string | null
    requestedBy?: string | null
}

export interface TransferItem {
    id: number
    transferId: number
    productId: number
    quantity: number
    lotId: number | null
    notes: string | null
}

export interface TransferItemInput {
    productId: number
    quantity: number
    lotId?: number | null
    notes?: string | null
}

export interface TransferItemUpdateInput {
    quantity?: number | null
    notes?: string | null
}

export interface TransferQueryParams extends PaginationParams {
    status?: TransferStatus
    sourceLocationId?: number
}

// Response type for items list (non-paginated)
interface TransferItemsResponse {
    data: TransferItem[]
    meta: { requestId: string; timestamp: string }
}

class TransferService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    // --- Transfers ---

    async getTransfers(params?: TransferQueryParams) {
        const queryParams = new URLSearchParams()

        if (params?.status) {
            queryParams.append('status', params.status)
        }
        if (params?.sourceLocationId !== undefined) {
            queryParams.append(
                'sourceLocationId',
                params.sourceLocationId.toString()
            )
        }
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }

        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/transfers?${queryString}`
            : `${this.config.host}/transfers`

        return ApiService.fetchData<PaginatedResponse<Transfer>>({
            url,
            method: 'get',
        })
    }

    async getTransfer(id: number) {
        return ApiService.fetchData<DataResponse<Transfer>>({
            url: `${this.config.host}/transfers/${id}`,
            method: 'get',
        })
    }

    async createTransfer(data: TransferInput) {
        return ApiService.fetchData<DataResponse<Transfer>>({
            url: `${this.config.host}/transfers`,
            method: 'post',
            data,
        })
    }

    async updateTransfer(id: number, data: TransferUpdateInput) {
        return ApiService.fetchData<DataResponse<Transfer>>({
            url: `${this.config.host}/transfers/${id}`,
            method: 'put',
            data,
        })
    }

    async deleteTransfer(id: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/transfers/${id}`,
            method: 'delete',
        })
    }

    async confirmTransfer(id: number) {
        return ApiService.fetchData<DataResponse<Transfer>>({
            url: `${this.config.host}/transfers/${id}/confirm`,
            method: 'post',
        })
    }

    async receiveTransfer(id: number) {
        return ApiService.fetchData<DataResponse<Transfer>>({
            url: `${this.config.host}/transfers/${id}/receive`,
            method: 'post',
        })
    }

    async cancelTransfer(id: number) {
        return ApiService.fetchData<DataResponse<Transfer>>({
            url: `${this.config.host}/transfers/${id}/cancel`,
            method: 'post',
        })
    }

    // --- Transfer Items ---

    async getTransferItems(transferId: number) {
        return ApiService.fetchData<TransferItemsResponse>({
            url: `${this.config.host}/transfers/${transferId}/items`,
            method: 'get',
        })
    }

    async addTransferItem(transferId: number, data: TransferItemInput) {
        return ApiService.fetchData<DataResponse<TransferItem>>({
            url: `${this.config.host}/transfers/${transferId}/items`,
            method: 'post',
            data,
        })
    }

    async updateTransferItem(itemId: number, data: TransferItemUpdateInput) {
        return ApiService.fetchData<DataResponse<TransferItem>>({
            url: `${this.config.host}/transfer-items/${itemId}`,
            method: 'put',
            data,
        })
    }

    async deleteTransferItem(itemId: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/transfer-items/${itemId}`,
            method: 'delete',
        })
    }
}

export default new TransferService()
