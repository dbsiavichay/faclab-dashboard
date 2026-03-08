import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
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

class PurchaseOrderService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    // --- Purchase Orders ---

    async getPurchaseOrders(params?: PurchaseOrderQueryParams) {
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
            ? `${this.config.host}/purchase-orders?${queryString}`
            : `${this.config.host}/purchase-orders`

        return ApiService.fetchData<PaginatedResponse<PurchaseOrder>>({
            url,
            method: 'get',
        })
    }

    async getPurchaseOrder(id: number) {
        return ApiService.fetchData<DataResponse<PurchaseOrder>>({
            url: `${this.config.host}/purchase-orders/${id}`,
            method: 'get',
        })
    }

    async createPurchaseOrder(data: PurchaseOrderInput) {
        return ApiService.fetchData<DataResponse<PurchaseOrder>>({
            url: `${this.config.host}/purchase-orders`,
            method: 'post',
            data,
        })
    }

    async updatePurchaseOrder(id: number, data: PurchaseOrderUpdateInput) {
        return ApiService.fetchData<DataResponse<PurchaseOrder>>({
            url: `${this.config.host}/purchase-orders/${id}`,
            method: 'put',
            data,
        })
    }

    async deletePurchaseOrder(id: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/purchase-orders/${id}`,
            method: 'delete',
        })
    }

    async sendPurchaseOrder(id: number) {
        return ApiService.fetchData<DataResponse<PurchaseOrder>>({
            url: `${this.config.host}/purchase-orders/${id}/send`,
            method: 'post',
        })
    }

    async cancelPurchaseOrder(id: number) {
        return ApiService.fetchData<DataResponse<PurchaseOrder>>({
            url: `${this.config.host}/purchase-orders/${id}/cancel`,
            method: 'post',
        })
    }

    async receivePurchaseOrder(id: number, data: ReceiveInput) {
        return ApiService.fetchData<DataResponse<PurchaseReceipt>>({
            url: `${this.config.host}/purchase-orders/${id}/receive`,
            method: 'post',
            data,
        })
    }

    // --- Purchase Order Items ---

    async getPurchaseOrderItems(orderId: number) {
        return ApiService.fetchData<PurchaseOrderItemsResponse>({
            url: `${this.config.host}/purchase-orders/${orderId}/items`,
            method: 'get',
        })
    }

    async addPurchaseOrderItem(data: PurchaseOrderItemInput) {
        return ApiService.fetchData<DataResponse<PurchaseOrderItem>>({
            url: `${this.config.host}/purchase-order-items`,
            method: 'post',
            data,
        })
    }

    async updatePurchaseOrderItem(
        itemId: number,
        data: PurchaseOrderItemUpdateInput
    ) {
        return ApiService.fetchData<DataResponse<PurchaseOrderItem>>({
            url: `${this.config.host}/purchase-order-items/${itemId}`,
            method: 'put',
            data,
        })
    }

    async deletePurchaseOrderItem(itemId: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/purchase-order-items/${itemId}`,
            method: 'delete',
        })
    }

    // --- Receipts ---

    async getPurchaseOrderReceipts(orderId: number) {
        return ApiService.fetchData<PurchaseReceiptsResponse>({
            url: `${this.config.host}/purchase-orders/${orderId}/receipts`,
            method: 'get',
        })
    }
}

export default new PurchaseOrderService()
