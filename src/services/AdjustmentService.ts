import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export type AdjustmentStatus = 'draft' | 'confirmed' | 'cancelled'

export type AdjustmentReason =
    | 'physical_count'
    | 'damaged'
    | 'theft'
    | 'expiration'
    | 'supplier_error'
    | 'correction'
    | 'other'

export const ADJUSTMENT_STATUS_LABELS: Record<AdjustmentStatus, string> = {
    draft: 'Borrador',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
}

export const ADJUSTMENT_STATUS_CLASSES: Record<AdjustmentStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    confirmed:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
    physical_count: 'Conteo físico',
    damaged: 'Productos dañados',
    theft: 'Robo',
    expiration: 'Productos vencidos',
    supplier_error: 'Error del proveedor',
    correction: 'Corrección general',
    other: 'Otros',
}

export interface Adjustment {
    id: number
    warehouseId: number
    reason: AdjustmentReason
    status: AdjustmentStatus
    adjustmentDate: string | null
    notes: string | null
    adjustedBy: string | null
    createdAt: string | null
}

export interface AdjustmentInput {
    warehouseId: number
    reason: AdjustmentReason
    notes?: string | null
    adjustedBy?: string | null
}

export interface AdjustmentUpdateInput {
    notes?: string | null
    adjustedBy?: string | null
}

export interface AdjustmentItem {
    id: number
    adjustmentId: number
    productId: number
    locationId: number
    expectedQuantity: number
    actualQuantity: number
    difference: number
    lotId: number | null
    notes: string | null
}

export interface AdjustmentItemInput {
    productId: number
    locationId: number
    actualQuantity: number
    lotId?: number | null
    notes?: string | null
}

export interface AdjustmentItemUpdateInput {
    actualQuantity?: number | null
    notes?: string | null
}

export interface AdjustmentQueryParams extends PaginationParams {
    status?: AdjustmentStatus
    warehouseId?: number
}

// Response type for items list (non-paginated)
interface AdjustmentItemsResponse {
    data: AdjustmentItem[]
    meta: { requestId: string; timestamp: string }
}

class AdjustmentService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    // --- Adjustments ---

    async getAdjustments(params?: AdjustmentQueryParams) {
        const queryParams = new URLSearchParams()

        if (params?.status) {
            queryParams.append('status', params.status)
        }
        if (params?.warehouseId !== undefined) {
            queryParams.append('warehouseId', params.warehouseId.toString())
        }
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }

        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/adjustments?${queryString}`
            : `${this.config.host}/adjustments`

        return ApiService.fetchData<PaginatedResponse<Adjustment>>({
            url,
            method: 'get',
        })
    }

    async getAdjustment(id: number) {
        return ApiService.fetchData<DataResponse<Adjustment>>({
            url: `${this.config.host}/adjustments/${id}`,
            method: 'get',
        })
    }

    async createAdjustment(data: AdjustmentInput) {
        return ApiService.fetchData<DataResponse<Adjustment>>({
            url: `${this.config.host}/adjustments`,
            method: 'post',
            data,
        })
    }

    async updateAdjustment(id: number, data: AdjustmentUpdateInput) {
        return ApiService.fetchData<DataResponse<Adjustment>>({
            url: `${this.config.host}/adjustments/${id}`,
            method: 'put',
            data,
        })
    }

    async deleteAdjustment(id: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/adjustments/${id}`,
            method: 'delete',
        })
    }

    async confirmAdjustment(id: number) {
        return ApiService.fetchData<DataResponse<Adjustment>>({
            url: `${this.config.host}/adjustments/${id}/confirm`,
            method: 'post',
        })
    }

    async cancelAdjustment(id: number) {
        return ApiService.fetchData<DataResponse<Adjustment>>({
            url: `${this.config.host}/adjustments/${id}/cancel`,
            method: 'post',
        })
    }

    // --- Adjustment Items ---

    async getAdjustmentItems(adjustmentId: number) {
        return ApiService.fetchData<AdjustmentItemsResponse>({
            url: `${this.config.host}/adjustments/${adjustmentId}/items`,
            method: 'get',
        })
    }

    async addAdjustmentItem(adjustmentId: number, data: AdjustmentItemInput) {
        return ApiService.fetchData<DataResponse<AdjustmentItem>>({
            url: `${this.config.host}/adjustments/${adjustmentId}/items`,
            method: 'post',
            data,
        })
    }

    async updateAdjustmentItem(
        itemId: number,
        data: AdjustmentItemUpdateInput
    ) {
        return ApiService.fetchData<DataResponse<AdjustmentItem>>({
            url: `${this.config.host}/adjustment-items/${itemId}`,
            method: 'put',
            data,
        })
    }

    async deleteAdjustmentItem(itemId: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/adjustment-items/${itemId}`,
            method: 'delete',
        })
    }
}

export default new AdjustmentService()
