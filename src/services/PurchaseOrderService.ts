import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export type PurchaseOrderStatus =
    | 'draft'
    | 'sent'
    | 'partial'
    | 'received'
    | 'cancelled'

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> =
    {
        draft: 'Borrador',
        sent: 'Enviada',
        partial: 'Parcial',
        received: 'Recibida',
        cancelled: 'Cancelada',
    }

export const PURCHASE_ORDER_STATUS_CLASSES: Record<
    PurchaseOrderStatus,
    string
> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    partial:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    received:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export interface PurchaseOrder {
    id: number
    supplierId: number
    orderNumber: string
    status: PurchaseOrderStatus
    subtotal: number
    tax: number
    total: number
    notes: string | null
    expectedDate: string | null
    createdAt: string | null
    updatedAt: string | null
}

export interface PurchaseOrderInput {
    supplierId: number
    notes?: string | null
    expectedDate?: string | null
}

export interface PurchaseOrderUpdateInput {
    supplierId?: number
    notes?: string | null
    expectedDate?: string | null
}

export interface PurchaseOrderItem {
    id: number
    purchaseOrderId: number
    productId: number
    quantityOrdered: number
    quantityReceived: number
    unitCost: number
}

export interface PurchaseOrderItemInput {
    purchaseOrderId: number
    productId: number
    quantityOrdered: number
    unitCost: number
}

export interface PurchaseOrderItemUpdateInput {
    quantityOrdered: number
    unitCost: number
}

export interface PurchaseReceipt {
    id: number
    purchaseOrderId: number
    notes: string | null
    receivedAt: string | null
    createdAt: string | null
}

export interface ReceiveItemInput {
    purchaseOrderItemId: number
    quantityReceived: number
    locationId?: number | null
    lotNumber?: string | null
    serialNumbers?: string[] | null
}

export interface ReceiveInput {
    items: ReceiveItemInput[]
    notes?: string | null
    receivedAt?: string | null
}

export interface PurchaseOrderQueryParams extends PaginationParams {
    status?: PurchaseOrderStatus
    supplierId?: number
}

interface PurchaseOrderItemsResponse {
    data: PurchaseOrderItem[]
    meta: { requestId: string; timestamp: string }
}

interface PurchaseReceiptsResponse {
    data: PurchaseReceipt[]
    meta: { requestId: string; timestamp: string }
}

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

// --- Purchase Orders ---

export async function getPurchaseOrders(params?: PurchaseOrderQueryParams) {
    const queryParams = new URLSearchParams()

    if (params?.status) {
        queryParams.append('status', params.status)
    }
    if (params?.supplierId !== undefined) {
        queryParams.append('supplierId', params.supplierId.toString())
    }
    if (params?.limit !== undefined) {
        queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
        queryParams.append('offset', params.offset.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString
        ? `${HOST}/purchase-orders?${queryString}`
        : `${HOST}/purchase-orders`

    return httpClient.get<PaginatedResponse<PurchaseOrder>>(url)
}

export async function getPurchaseOrder(id: number) {
    return httpClient.get<DataResponse<PurchaseOrder>>(
        `${HOST}/purchase-orders/${id}`
    )
}

export async function createPurchaseOrder(data: PurchaseOrderInput) {
    return httpClient.post<DataResponse<PurchaseOrder>>(
        `${HOST}/purchase-orders`,
        data
    )
}

export async function updatePurchaseOrder(
    id: number,
    data: PurchaseOrderUpdateInput
) {
    return httpClient.put<DataResponse<PurchaseOrder>>(
        `${HOST}/purchase-orders/${id}`,
        data
    )
}

export async function deletePurchaseOrder(id: number) {
    return httpClient.delete(`${HOST}/purchase-orders/${id}`)
}

export async function sendPurchaseOrder(id: number) {
    return httpClient.post<DataResponse<PurchaseOrder>>(
        `${HOST}/purchase-orders/${id}/send`
    )
}

export async function cancelPurchaseOrder(id: number) {
    return httpClient.post<DataResponse<PurchaseOrder>>(
        `${HOST}/purchase-orders/${id}/cancel`
    )
}

export async function receivePurchaseOrder(id: number, data: ReceiveInput) {
    return httpClient.post<DataResponse<PurchaseReceipt>>(
        `${HOST}/purchase-orders/${id}/receive`,
        data
    )
}

// --- Purchase Order Items ---

export async function getPurchaseOrderItems(orderId: number) {
    return httpClient.get<PurchaseOrderItemsResponse>(
        `${HOST}/purchase-orders/${orderId}/items`
    )
}

export async function addPurchaseOrderItem(data: PurchaseOrderItemInput) {
    return httpClient.post<DataResponse<PurchaseOrderItem>>(
        `${HOST}/purchase-order-items`,
        data
    )
}

export async function updatePurchaseOrderItem(
    itemId: number,
    data: PurchaseOrderItemUpdateInput
) {
    return httpClient.put<DataResponse<PurchaseOrderItem>>(
        `${HOST}/purchase-order-items/${itemId}`,
        data
    )
}

export async function deletePurchaseOrderItem(itemId: number) {
    return httpClient.delete(`${HOST}/purchase-order-items/${itemId}`)
}

// --- Receipts ---

export async function getPurchaseOrderReceipts(orderId: number) {
    return httpClient.get<PurchaseReceiptsResponse>(
        `${HOST}/purchase-orders/${orderId}/receipts`
    )
}
