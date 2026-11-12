import type { PaginationParams } from '@/@types/api'
import type { TaxCode } from '@/constants/tax.constant'
import type { StatusTone } from '@shared/lib/statusTone'

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

export const PURCHASE_ORDER_STATUS_TONES: Record<
    PurchaseOrderStatus,
    StatusTone
> = {
    draft: 'neutral',
    sent: 'info',
    partial: 'warning',
    received: 'success',
    cancelled: 'danger',
}

/** Taxable base and VAT of one rate, to the cent (S5.7) */
export interface TaxRate {
    taxCode: TaxCode
    rate: number
    base: number
    tax: number
}

export interface PurchaseOrder {
    id: number
    supplierId: number
    supplierName: string | null
    orderNumber: string
    status: PurchaseOrderStatus
    /** Sum of the lines without VAT */
    subtotal: number
    /** VAT: each rate rounded to the cent and added (S5.7) */
    tax: number
    total: number
    /** By rate, highest first; only in the order's detail */
    taxes?: TaxRate[] | null
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
    // Only in the item list of an order
    productName?: string | null
    productSku?: string | null
    /** In its presentation (S5.2): ordered, received and pending, like the cost */
    quantityOrdered: number
    quantityReceived: number
    /** Given back to the supplier, in its presentation (S5.7) */
    quantityReturned?: number
    /** Without VAT */
    unitCost: number
    /** The product's VAT code when the line was added (S5.7) */
    taxCode?: TaxCode
    /** Ordered × cost, without VAT, at full precision */
    subtotal?: number
    /** The line's VAT at full precision; the order rounds each rate */
    taxAmount?: number
    /** The presentation it is bought in; null before S5.2 (the base unit) */
    presentationId?: number | null
    presentationName?: string | null
    /** Base units in one of its presentation */
    unitFactor?: number
}

export interface PurchaseOrderItemInput {
    purchaseOrderId: number
    productId: number
    /** Omitted: the base unit */
    presentationId?: number | null
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
    /** The supplier's invoice for the delivery (S5.7) */
    supplierInvoiceNumber?: string | null
    /** What was received at the lines' costs, with its VAT: what is owed */
    subtotal?: number
    tax?: number
    total?: number
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
    supplierInvoiceNumber?: string | null
}

export interface PurchaseOrderQueryParams extends PaginationParams {
    status?: PurchaseOrderStatus
    supplierId?: number
}

// --- Supplier returns (S5.7) ---

export const SUPPLIER_RETURN_STATUSES = ['draft', 'confirmed'] as const

export type SupplierReturnStatus = (typeof SUPPLIER_RETURN_STATUSES)[number]

export const SUPPLIER_RETURN_STATUS_LABELS: Record<
    SupplierReturnStatus,
    string
> = {
    draft: 'Borrador',
    confirmed: 'Confirmada',
}

export const SUPPLIER_RETURN_STATUS_TONES: Record<
    SupplierReturnStatus,
    StatusTone
> = {
    draft: 'neutral',
    confirmed: 'success',
}

export interface SupplierReturn {
    id: number
    /** DP-2026-0001 */
    number: string | null
    supplierId: number
    supplierName?: string | null
    purchaseOrderId: number
    orderNumber?: string | null
    status: SupplierReturnStatus
    notes: string | null
    /** The supplier's credit note for it */
    supplierCreditNoteNumber: string | null
    subtotal: number
    tax: number
    /** What the supplier credits, with VAT */
    total: number
    /** What it took off the supplier's accounts payable */
    creditedAmount: number
    /** What the supplier has to refund: it had already been paid */
    refundDue: number
    /** By rate; only in the detail */
    taxes?: TaxRate[] | null
    confirmedAt: string | null
    confirmedBy: string | null
    createdAt: string | null
    updatedAt: string | null
}

export interface SupplierReturnItem {
    id: number
    supplierReturnId: number
    purchaseOrderItemId: number
    productId: number
    productName?: string | null
    productSku?: string | null
    presentationId?: number | null
    presentationName?: string | null
    unitFactor: number
    /** In the order line's presentation */
    quantity: number
    /** What leaves the stock */
    baseQuantity: number
    /** The order line's cost and VAT: what the supplier charged */
    unitCost: number
    taxCode: TaxCode
    subtotal: number
    taxAmount: number
    locationId: number | null
}

export interface SupplierReturnInput {
    purchaseOrderId: number
    notes?: string | null
}

export interface SupplierReturnItemInput {
    purchaseOrderItemId: number
    quantity: number
    locationId?: number | null
}

export interface SupplierReturnItemUpdateInput {
    quantity: number
    locationId?: number | null
}

export interface SupplierReturnListParams extends PaginationParams {
    status?: SupplierReturnStatus
    supplierId?: number
    purchaseOrderId?: number
}

/** What core's supplier return errors mean, for the user */
export const SUPPLIER_RETURN_ERROR_MESSAGES: Record<string, string> = {
    PURCHASE_ORDER_NOT_RETURNABLE:
        'La orden no tiene mercadería recibida por devolver',
    EXCEEDS_RETURNABLE_QUANTITY:
        'La cantidad pasa de lo recibido menos lo ya devuelto',
    SUPPLIER_RETURN_WITHOUT_ITEMS: 'La devolución no tiene líneas',
    INVALID_SUPPLIER_RETURN_STATUS: 'La devolución ya está confirmada',
    INSUFFICIENT_STOCK: 'La ubicación ya no tiene esa mercadería en stock',
}
