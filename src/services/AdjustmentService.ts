import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
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

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

// --- Adjustments ---

export async function getAdjustments(params?: AdjustmentQueryParams) {
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
        ? `${HOST}/adjustments?${queryString}`
        : `${HOST}/adjustments`

    return httpClient.get<PaginatedResponse<Adjustment>>(url)
}

export async function getAdjustment(id: number) {
    return httpClient.get<DataResponse<Adjustment>>(`${HOST}/adjustments/${id}`)
}

export async function createAdjustment(data: AdjustmentInput) {
    return httpClient.post<DataResponse<Adjustment>>(
        `${HOST}/adjustments`,
        data
    )
}

export async function updateAdjustment(
    id: number,
    data: AdjustmentUpdateInput
) {
    return httpClient.put<DataResponse<Adjustment>>(
        `${HOST}/adjustments/${id}`,
        data
    )
}

export async function deleteAdjustment(id: number) {
    return httpClient.delete(`${HOST}/adjustments/${id}`)
}

export async function confirmAdjustment(id: number) {
    return httpClient.post<DataResponse<Adjustment>>(
        `${HOST}/adjustments/${id}/confirm`
    )
}

export async function cancelAdjustment(id: number) {
    return httpClient.post<DataResponse<Adjustment>>(
        `${HOST}/adjustments/${id}/cancel`
    )
}

// --- Adjustment Items ---

export async function getAdjustmentItems(adjustmentId: number) {
    return httpClient.get<AdjustmentItemsResponse>(
        `${HOST}/adjustments/${adjustmentId}/items`
    )
}

export async function addAdjustmentItem(
    adjustmentId: number,
    data: AdjustmentItemInput
) {
    return httpClient.post<DataResponse<AdjustmentItem>>(
        `${HOST}/adjustments/${adjustmentId}/items`,
        data
    )
}

export async function updateAdjustmentItem(
    itemId: number,
    data: AdjustmentItemUpdateInput
) {
    return httpClient.put<DataResponse<AdjustmentItem>>(
        `${HOST}/adjustment-items/${itemId}`,
        data
    )
}

export async function deleteAdjustmentItem(itemId: number) {
    return httpClient.delete(`${HOST}/adjustment-items/${itemId}`)
}
