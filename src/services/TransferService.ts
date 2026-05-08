import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
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

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

// --- Transfers ---

export async function getTransfers(params?: TransferQueryParams) {
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
        ? `${HOST}/transfers?${queryString}`
        : `${HOST}/transfers`

    return httpClient.get<PaginatedResponse<Transfer>>(url)
}

export async function getTransfer(id: number) {
    return httpClient.get<DataResponse<Transfer>>(`${HOST}/transfers/${id}`)
}

export async function createTransfer(data: TransferInput) {
    return httpClient.post<DataResponse<Transfer>>(`${HOST}/transfers`, data)
}

export async function updateTransfer(id: number, data: TransferUpdateInput) {
    return httpClient.put<DataResponse<Transfer>>(
        `${HOST}/transfers/${id}`,
        data
    )
}

export async function deleteTransfer(id: number) {
    return httpClient.delete(`${HOST}/transfers/${id}`)
}

export async function confirmTransfer(id: number) {
    return httpClient.post<DataResponse<Transfer>>(
        `${HOST}/transfers/${id}/confirm`
    )
}

export async function receiveTransfer(id: number) {
    return httpClient.post<DataResponse<Transfer>>(
        `${HOST}/transfers/${id}/receive`
    )
}

export async function cancelTransfer(id: number) {
    return httpClient.post<DataResponse<Transfer>>(
        `${HOST}/transfers/${id}/cancel`
    )
}

// --- Transfer Items ---

export async function getTransferItems(transferId: number) {
    return httpClient.get<TransferItemsResponse>(
        `${HOST}/transfers/${transferId}/items`
    )
}

export async function addTransferItem(
    transferId: number,
    data: TransferItemInput
) {
    return httpClient.post<DataResponse<TransferItem>>(
        `${HOST}/transfers/${transferId}/items`,
        data
    )
}

export async function updateTransferItem(
    itemId: number,
    data: TransferItemUpdateInput
) {
    return httpClient.put<DataResponse<TransferItem>>(
        `${HOST}/transfer-items/${itemId}`,
        data
    )
}

export async function deleteTransferItem(itemId: number) {
    return httpClient.delete(`${HOST}/transfer-items/${itemId}`)
}
