import type { TaxCode } from '@/constants/tax.constant'
import type { CreditNote } from '@features/invoicing'
import type { StatusTone } from '@shared/lib/statusTone'

export type SaleStatus = 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID'
// SRI forms of payment, as defined by faclab-core. CREDIT (S5.5) is what the
// customer owes on its account: it goes to the cash register on payments on
// account, not with the sale
export const PAYMENT_METHODS = [
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'TRANSFER',
    'OTHER',
    'CREDIT',
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
    DRAFT: 'Borrador',
    CONFIRMED: 'Confirmada',
    INVOICED: 'Facturada',
    CANCELLED: 'Cancelada',
}

export const SALE_STATUS_TONES: Record<SaleStatus, StatusTone> = {
    DRAFT: 'neutral',
    CONFIRMED: 'info',
    INVOICED: 'success',
    CANCELLED: 'danger',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    PENDING: 'Pendiente',
    PARTIAL: 'Parcial',
    PAID: 'Pagado',
}

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, StatusTone> = {
    PENDING: 'warning',
    PARTIAL: 'info',
    PAID: 'success',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CREDIT_CARD: 'Tarjeta crédito',
    DEBIT_CARD: 'Tarjeta débito',
    TRANSFER: 'Transferencia',
    OTHER: 'Otro',
    CREDIT: 'Crédito',
}

// Factura electrónica de la venta en faclab-invoicing (InvoiceStatus del core);
// null si nunca se envió
export const SALE_INVOICE_STATUSES = [
    'PENDING',
    'AUTHORIZED',
    'REJECTED',
    'CREDITED',
] as const
export type SaleInvoiceStatus = (typeof SALE_INVOICE_STATUSES)[number]

export const SALE_INVOICE_STATUS_LABELS: Record<SaleInvoiceStatus, string> = {
    PENDING: 'Factura pendiente',
    AUTHORIZED: 'Factura autorizada',
    REJECTED: 'Factura rechazada',
    CREDITED: 'Factura anulada con nota de crédito',
}

export const SALE_INVOICE_STATUS_TONES: Record<SaleInvoiceStatus, StatusTone> =
    {
        PENDING: 'warning',
        AUTHORIZED: 'success',
        REJECTED: 'danger',
        CREDITED: 'info',
    }

export interface Sale {
    id: number
    /** Número de la sucursal (`V-001-000123`); null en borradores y ventas anteriores */
    number: string | null
    branchId: number | null
    emissionPointId: number | null
    terminalId: number | null
    /** La cotización que la venta cobró (S5.4); null en las demás */
    quoteId: number | null
    customerId: number | null
    customerName: string | null
    status: SaleStatus
    saleDate: string | null
    subtotal: number
    tax: number
    discount: number
    total: number
    paymentStatus: PaymentStatus
    notes: string | null
    createdBy: string | null
    invoiceStatus: SaleInvoiceStatus | null
    /** Id en faclab-invoicing de la última factura con resultado */
    invoiceId: string | null
    /** Mensajes del SRI mientras la factura está rechazada */
    invoiceRejectionReason: string | null
    /** Cuándo se envió a facturación por última vez (al confirmar o reenviar) */
    invoiceRequestedAt: string | null
    createdAt: string
    updatedAt: string | null
}

export interface SaleItem {
    id: number
    saleId: number
    productId: number
    productName: string | null
    productSku: string | null
    /** In its presentation (S5.2), like the price */
    quantity: number
    presentationId?: number | null
    presentationName?: string | null
    unitFactor?: number
    /** What moved the stock: quantity × unitFactor */
    baseQuantity?: number
    unitPrice: number
    discount: number
    taxCode: TaxCode
    taxAmount: number
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
    /** Días de plazo de un pago CREDIT (S5.5) */
    termDays?: number | null
    createdAt: string
}

export interface SaleQueryParams {
    customerId?: number
    status?: SaleStatus
    invoiceStatus?: SaleInvoiceStatus
    limit?: number
    offset?: number
}

// Conciliación con faclab-invoicing (S4.3): GET /api/admin/invoice-discrepancies
export const DISCREPANCY_KIND_LABELS = {
    // Confirmada y sin resultado de facturación después del umbral
    confirmed_without_result: 'Sin resultado de facturación',
    // El SRI autorizó la factura de una venta ya anulada
    authorized_on_cancelled: 'Factura autorizada de venta anulada',
} as const
export type DiscrepancyKind = keyof typeof DISCREPANCY_KIND_LABELS

export const DISCREPANCY_STATUS_LABELS = {
    open: 'Abierta',
    reviewed: 'Revisada',
    resolved: 'Resuelta',
} as const
export type DiscrepancyStatus = keyof typeof DISCREPANCY_STATUS_LABELS

export const DISCREPANCY_STATUS_TONES: Record<DiscrepancyStatus, StatusTone> = {
    open: 'warning',
    reviewed: 'info',
    resolved: 'success',
}

export interface InvoiceDiscrepancy {
    id: number
    kind: DiscrepancyKind
    status: DiscrepancyStatus
    saleId: number
    invoiceId: string | null
    detectedAt: string
    resolvedAt: string | null
    reviewedAt: string | null
    reviewedByName: string | null
    reviewNote: string | null
    /** La venta tal como está ahora */
    sale: {
        id: number
        number: string | null
        status: SaleStatus
        total: number
        branchId: number | null
        /** Null: consumidor final, su factura no admite nota de crédito */
        customerId?: number | null
        saleDate: string | null
        invoiceStatus: SaleInvoiceStatus | null
        invoiceRequestedAt: string | null
    } | null
    /** La nota de crédito de la factura de una venta anulada, una vez pedida */
    creditNote?: CreditNote | null
}

export interface DiscrepancyQueryParams {
    status?: DiscrepancyStatus
    kind?: DiscrepancyKind
    limit?: number
    offset?: number
}
