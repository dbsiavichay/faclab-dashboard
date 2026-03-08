import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export type SaleStatus = 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID'
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT'

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
    DRAFT: 'Borrador',
    CONFIRMED: 'Confirmada',
    INVOICED: 'Facturada',
    CANCELLED: 'Cancelada',
}

export const SALE_STATUS_CLASSES: Record<SaleStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    CONFIRMED:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    INVOICED:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    PENDING: 'Pendiente',
    PARTIAL: 'Parcial',
    PAID: 'Pagado',
}

export const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
    PENDING:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    CREDIT: 'Crédito',
}

export interface Sale {
    id: number
    customerId: number
    status: SaleStatus
    saleDate: string | null
    subtotal: number
    tax: number
    discount: number
    total: number
    paymentStatus: PaymentStatus
    notes: string | null
    createdBy: string | null
    createdAt: string
    updatedAt: string | null
}

export interface SaleItem {
    id: number
    saleId: number
    productId: number
    quantity: number
    unitPrice: number
    discount: number
    subtotal: number
}

export interface Payment {
    id: number
    saleId: number
    amount: number
    paymentMethod: PaymentMethod
    paymentDate: string | null
    reference: string | null
    notes: string | null
    createdAt: string
}

export interface SaleQueryParams extends PaginationParams {
    customerId?: number
    status?: SaleStatus
}

interface SaleItemsResponse {
    data: SaleItem[]
    meta: { requestId: string; timestamp: string }
}

interface PaymentsResponse {
    data: Payment[]
    meta: { requestId: string; timestamp: string }
}

class SaleService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getSales(params?: SaleQueryParams) {
        const queryParams = new URLSearchParams()

        if (params?.customerId !== undefined) {
            queryParams.append('customerId', params.customerId.toString())
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
            ? `${this.config.host}/sales?${queryString}`
            : `${this.config.host}/sales`

        return ApiService.fetchData<PaginatedResponse<Sale>>({
            url,
            method: 'get',
        })
    }

    async getSale(id: number) {
        return ApiService.fetchData<DataResponse<Sale>>({
            url: `${this.config.host}/sales/${id}`,
            method: 'get',
        })
    }

    async getSaleItems(saleId: number) {
        return ApiService.fetchData<SaleItemsResponse>({
            url: `${this.config.host}/sales/${saleId}/items`,
            method: 'get',
        })
    }

    async getSalePayments(saleId: number) {
        return ApiService.fetchData<PaymentsResponse>({
            url: `${this.config.host}/sales/${saleId}/payments`,
            method: 'get',
        })
    }
}

export default new SaleService()
