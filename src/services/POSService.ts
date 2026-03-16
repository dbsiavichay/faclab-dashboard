import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
    Meta,
} from '@/@types/api'

// === ENUMS ===
export type ShiftStatus = 'OPEN' | 'CLOSED'
export type POSSaleStatus = 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED'
export type POSPaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID'
export type POSPaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT'
export type CashMovementType = 'IN' | 'OUT'
export type RefundStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'
export type DiscountType = 'PERCENTAGE' | 'AMOUNT'

// === LABELS ===
export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
    OPEN: 'Abierto',
    CLOSED: 'Cerrado',
}

export const SHIFT_STATUS_CLASSES: Record<ShiftStatus, string> = {
    OPEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    CLOSED: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
}

export const POS_SALE_STATUS_LABELS: Record<POSSaleStatus, string> = {
    DRAFT: 'Borrador',
    CONFIRMED: 'Confirmada',
    INVOICED: 'Facturada',
    CANCELLED: 'Cancelada',
}

export const POS_SALE_STATUS_CLASSES: Record<POSSaleStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    CONFIRMED:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    INVOICED:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export const POS_PAYMENT_STATUS_LABELS: Record<POSPaymentStatus, string> = {
    PENDING: 'Pendiente',
    PARTIAL: 'Parcial',
    PAID: 'Pagado',
}

export const POS_PAYMENT_STATUS_CLASSES: Record<POSPaymentStatus, string> = {
    PENDING:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
}

export const POS_PAYMENT_METHOD_LABELS: Record<POSPaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    CREDIT: 'Crédito',
}

export const CASH_MOVEMENT_TYPE_LABELS: Record<CashMovementType, string> = {
    IN: 'Ingreso',
    OUT: 'Egreso',
}

export const CASH_MOVEMENT_TYPE_CLASSES: Record<CashMovementType, string> = {
    IN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    OUT: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
    PENDING: 'Pendiente',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
}

export const REFUND_STATUS_CLASSES: Record<RefundStatus, string> = {
    PENDING:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    COMPLETED:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

// === SHIFTS ===
export interface Shift {
    id: number
    cashierName: string
    openedAt: string
    closedAt: string | null
    openingBalance: number
    closingBalance: number | null
    expectedBalance: number | null
    discrepancy: number | null
    status: ShiftStatus
    notes: string | null
}

export interface OpenShiftInput {
    cashierName: string
    openingBalance: number
    notes?: string
}

export interface CloseShiftInput {
    closingBalance: number
    notes?: string
}

// === SALES ===
export interface POSSale {
    id: number
    customerId: number | null
    isFinalConsumer: boolean
    shiftId: number
    status: POSSaleStatus
    saleDate: string | null
    subtotal: number
    tax: number
    discount: number
    discountType: DiscountType | null
    discountValue: number
    total: number
    paymentStatus: POSPaymentStatus
    notes: string | null
    createdBy: string | null
    parkedAt: string | null
    parkReason: string | null
    createdAt: string
}

export interface POSSaleItem {
    id: number
    saleId: number
    productId: number
    quantity: number
    unitPrice: number
    discount: number
    taxRate: number
    taxAmount: number
    subtotal: number
    priceOverride: number | null
    overrideReason: string | null
}

export interface POSPayment {
    id: number
    saleId: number
    amount: number
    paymentMethod: POSPaymentMethod
    paymentDate: string
    reference: string | null
    notes: string | null
}

// === INPUTS ===
export interface CreateSaleInput {
    customerId?: number | null
    isFinalConsumer?: boolean
    notes?: string
    createdBy?: string
}

export interface QuickSaleInput {
    customerId?: number | null
    items: QuickSaleItemInput[]
    payments: QuickSalePaymentInput[]
    notes?: string
    createdBy?: string
}

export interface QuickSaleItemInput {
    productId: number
    quantity: number
    unitPrice?: number
    discount?: number
}

export interface QuickSalePaymentInput {
    amount: number
    paymentMethod: POSPaymentMethod
    reference?: string
    notes?: string
}

export interface AddSaleItemInput {
    productId: number
    quantity: number
}

export interface UpdateSaleItemInput {
    quantity: number
}

export interface SaleDiscountInput {
    discountType: DiscountType
    discountValue: number
}

export interface PriceOverrideInput {
    newPrice: number
    reason: string
}

export interface PaymentInput {
    amount: number
    paymentMethod: POSPaymentMethod
    reference?: string
    notes?: string
}

// === REFUNDS ===
export interface Refund {
    id: number
    originalSaleId: number
    shiftId: number
    refundDate: string | null
    subtotal: number
    tax: number
    total: number
    reason: string | null
    status: RefundStatus
    refundedBy: string | null
}

export interface RefundItem {
    id: number
    refundId: number
    originalSaleItemId: number
    productId: number
    quantity: number
    unitPrice: number
    discount: number
    taxRate: number
    taxAmount: number
    subtotal: number
}

export interface CreateRefundInput {
    originalSaleId: number
    items: { saleItemId: number; quantity: number }[]
    reason?: string
    refundedBy?: string
}

export interface ProcessRefundInput {
    payments: {
        amount: number
        paymentMethod: POSPaymentMethod
        reference?: string
    }[]
}

// === CASH MOVEMENTS ===
export interface CashMovement {
    id: number
    shiftId: number
    type: CashMovementType
    amount: number
    reason: string | null
    performedBy: string | null
    createdAt: string
}

export interface CashMovementInput {
    type: CashMovementType
    amount: number
    reason?: string
    performedBy?: string
}

export interface CashSummary {
    shiftId: number
    openingBalance: number
    cashSales: number
    cashRefunds: number
    cashIn: number
    cashOut: number
    expectedBalance: number
}

// === RECEIPT ===
export interface ReceiptItem {
    productName: string
    quantity: number
    unitPrice: number
    discount: number
    discountAmount: number
    taxRate: number
    taxAmount: number
    subtotal: number
    priceOverride: number | null
    overrideReason: string | null
}

export interface Receipt {
    saleId: number
    saleDate: string
    status: string
    cashier: string
    customer: { name: string; taxId: string } | null
    isFinalConsumer: boolean
    items: ReceiptItem[]
    taxBreakdown: {
        taxRate: number
        taxableBase: number
        taxAmount: number
    }[]
    subtotal: number
    discount: number
    discountType: DiscountType | null
    discountValue: number
    tax: number
    total: number
    payments: {
        method: string
        amount: number
        reference: string | null
    }[]
    totalPaid: number
    change: number
}

// === REPORTS ===
export interface XReport {
    shift: Shift
    salesSummary: {
        count: number
        subtotal: number
        tax: number
        discount: number
        total: number
    }
    paymentsByMethod: {
        paymentMethod: string
        count: number
        total: number
    }[]
    itemsSold: {
        productName: string
        sku: string
        quantity: number
        total: number
    }[]
}

export interface ZReport extends XReport {
    refundSummary: { count: number; total: number }
    cashReconciliation: CashSummary & {
        closingBalance: number
        discrepancy: number
    }
}

export interface DailyReport {
    date: string
    totalSales: number
    totalAmount: number
    paymentsByMethod: {
        paymentMethod: string
        count: number
        total: number
    }[]
    topProducts: {
        productName: string
        sku: string
        quantity: number
        total: number
    }[]
    refundSummary: { count: number; total: number }
}

// === POS PRODUCT ===
export interface POSProduct {
    id: number
    name: string
    sku: string
    barcode: string | null
    categoryId: number | null
    salePrice: number | null
    isActive: boolean
}

// === POS CUSTOMER ===
export interface POSCustomer {
    id: number
    name: string
    taxId: string
    taxType: string
}

export interface QuickCustomerInput {
    name: string
    taxId: string
    taxType: string
}

// === LIST RESPONSE ===
interface ListResponse<T> {
    data: T[]
    meta: Meta
}

// === SERVICE ===
class POSService {
    private config = {
        host: appConfig.posApiHost || 'http://localhost:3000/api/pos',
    }

    // --- Shifts ---

    async getActiveShift() {
        return ApiService.fetchData<DataResponse<Shift | null>>({
            url: `${this.config.host}/shifts/active`,
            method: 'get',
        })
    }

    async openShift(data: OpenShiftInput) {
        return ApiService.fetchData<DataResponse<Shift>>({
            url: `${this.config.host}/shifts/open`,
            method: 'post',
            data,
        })
    }

    async closeShift(shiftId: number, data: CloseShiftInput) {
        return ApiService.fetchData<DataResponse<Shift>>({
            url: `${this.config.host}/shifts/${shiftId}/close`,
            method: 'post',
            data,
        })
    }

    async getShift(id: number) {
        return ApiService.fetchData<DataResponse<Shift>>({
            url: `${this.config.host}/shifts/${id}`,
            method: 'get',
        })
    }

    async getShifts(params?: PaginationParams) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/shifts?${queryString}`
            : `${this.config.host}/shifts`

        return ApiService.fetchData<PaginatedResponse<Shift>>({
            url,
            method: 'get',
        })
    }

    // --- Sales ---

    async createSale(data: CreateSaleInput) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales`,
            method: 'post',
            data,
        })
    }

    async quickSale(data: QuickSaleInput) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales/quick`,
            method: 'post',
            data,
        })
    }

    async getSale(id: number) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales/${id}`,
            method: 'get',
        })
    }

    async addSaleItem(saleId: number, data: AddSaleItemInput) {
        return ApiService.fetchData<DataResponse<POSSaleItem>>({
            url: `${this.config.host}/sales/${saleId}/items`,
            method: 'post',
            data,
        })
    }

    async getSaleItems(saleId: number) {
        return ApiService.fetchData<ListResponse<POSSaleItem>>({
            url: `${this.config.host}/sales/${saleId}/items`,
            method: 'get',
        })
    }

    async updateSaleItem(
        saleId: number,
        itemId: number,
        data: UpdateSaleItemInput
    ) {
        return ApiService.fetchData<DataResponse<POSSaleItem>>({
            url: `${this.config.host}/sales/${saleId}/items/${itemId}`,
            method: 'put',
            data,
        })
    }

    async deleteSaleItem(saleId: number, itemId: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/sales/${saleId}/items/${itemId}`,
            method: 'delete',
        })
    }

    async confirmSale(saleId: number) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales/${saleId}/confirm`,
            method: 'post',
        })
    }

    async cancelSale(saleId: number, reason?: string) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales/${saleId}/cancel`,
            method: 'post',
            data: reason ? { reason } : undefined,
        })
    }

    async parkSale(saleId: number, reason?: string) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales/${saleId}/park`,
            method: 'post',
            data: reason ? { reason } : undefined,
        })
    }

    async resumeSale(saleId: number) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales/${saleId}/resume`,
            method: 'post',
        })
    }

    async getParkedSales() {
        return ApiService.fetchData<ListResponse<POSSale>>({
            url: `${this.config.host}/sales/parked`,
            method: 'get',
        })
    }

    async applySaleDiscount(saleId: number, data: SaleDiscountInput) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.config.host}/sales/${saleId}/discount`,
            method: 'post',
            data,
        })
    }

    async addPayment(saleId: number, data: PaymentInput) {
        return ApiService.fetchData<DataResponse<POSPayment>>({
            url: `${this.config.host}/sales/${saleId}/payments`,
            method: 'post',
            data,
        })
    }

    async getSalePayments(saleId: number) {
        return ApiService.fetchData<ListResponse<POSPayment>>({
            url: `${this.config.host}/sales/${saleId}/payments`,
            method: 'get',
        })
    }

    async overrideItemPrice(
        saleId: number,
        itemId: number,
        data: PriceOverrideInput
    ) {
        return ApiService.fetchData<DataResponse<POSSaleItem>>({
            url: `${this.config.host}/sales/${saleId}/items/${itemId}/price`,
            method: 'put',
            data,
        })
    }

    async getReceipt(saleId: number) {
        return ApiService.fetchData<DataResponse<Receipt>>({
            url: `${this.config.host}/sales/${saleId}/receipt`,
            method: 'get',
        })
    }

    // --- Refunds ---

    async createRefund(data: CreateRefundInput) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.config.host}/refunds`,
            method: 'post',
            data,
        })
    }

    async processRefund(refundId: number, data: ProcessRefundInput) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.config.host}/refunds/${refundId}/process`,
            method: 'post',
            data,
        })
    }

    async cancelRefund(refundId: number) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.config.host}/refunds/${refundId}/cancel`,
            method: 'post',
        })
    }

    async getRefund(id: number) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.config.host}/refunds/${id}`,
            method: 'get',
        })
    }

    async getRefunds(params?: PaginationParams) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/refunds?${queryString}`
            : `${this.config.host}/refunds`

        return ApiService.fetchData<PaginatedResponse<Refund>>({
            url,
            method: 'get',
        })
    }

    // --- Cash Movements ---

    async addCashMovement(shiftId: number, data: CashMovementInput) {
        return ApiService.fetchData<DataResponse<CashMovement>>({
            url: `${this.config.host}/shifts/${shiftId}/cash-movements`,
            method: 'post',
            data,
        })
    }

    async getCashMovements(shiftId: number) {
        return ApiService.fetchData<ListResponse<CashMovement>>({
            url: `${this.config.host}/shifts/${shiftId}/cash-movements`,
            method: 'get',
        })
    }

    async getCashSummary(shiftId: number) {
        return ApiService.fetchData<DataResponse<CashSummary>>({
            url: `${this.config.host}/shifts/${shiftId}/cash-summary`,
            method: 'get',
        })
    }

    // --- Reports ---

    async getXReport(shiftId: number) {
        return ApiService.fetchData<DataResponse<XReport>>({
            url: `${this.config.host}/reports/x-report?shiftId=${shiftId}`,
            method: 'get',
        })
    }

    async getZReport(shiftId: number) {
        return ApiService.fetchData<DataResponse<ZReport>>({
            url: `${this.config.host}/reports/z-report?shiftId=${shiftId}`,
            method: 'get',
        })
    }

    async getDailyReport(date: string) {
        return ApiService.fetchData<DataResponse<DailyReport>>({
            url: `${this.config.host}/reports/daily?date=${date}`,
            method: 'get',
        })
    }

    async getByPaymentMethod(fromDate: string, toDate: string) {
        return ApiService.fetchData<
            DataResponse<
                {
                    paymentMethod: string
                    count: number
                    total: number
                }[]
            >
        >({
            url: `${this.config.host}/reports/by-payment-method?fromDate=${fromDate}&toDate=${toDate}`,
            method: 'get',
        })
    }

    // --- Products ---

    async getProducts() {
        return ApiService.fetchData<ListResponse<POSProduct>>({
            url: `${this.config.host}/products`,
            method: 'get',
        })
    }

    async searchProducts(term: string, limit?: number) {
        const queryParams = new URLSearchParams({ term })
        if (limit !== undefined) {
            queryParams.append('limit', limit.toString())
        }
        return ApiService.fetchData<ListResponse<POSProduct>>({
            url: `${
                this.config.host
            }/products/search?${queryParams.toString()}`,
            method: 'get',
        })
    }

    async getProduct(id: number) {
        return ApiService.fetchData<DataResponse<POSProduct>>({
            url: `${this.config.host}/products/${id}`,
            method: 'get',
        })
    }

    // --- Customers ---

    async getCustomers() {
        return ApiService.fetchData<ListResponse<POSCustomer>>({
            url: `${this.config.host}/customers`,
            method: 'get',
        })
    }

    async searchCustomerByTaxId(taxId: string) {
        return ApiService.fetchData<DataResponse<POSCustomer>>({
            url: `${this.config.host}/customers/search/by-tax-id?taxId=${taxId}`,
            method: 'get',
        })
    }

    async quickCreateCustomer(data: QuickCustomerInput) {
        return ApiService.fetchData<DataResponse<POSCustomer>>({
            url: `${this.config.host}/customers`,
            method: 'post',
            data,
        })
    }

    async getCustomer(id: number) {
        return ApiService.fetchData<DataResponse<POSCustomer>>({
            url: `${this.config.host}/customers/${id}`,
            method: 'get',
        })
    }
}

export default new POSService()
