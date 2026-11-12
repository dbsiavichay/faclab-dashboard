import type { PaymentMethod } from '@features/sales'
import type { StatusTone } from '@shared/lib/statusTone'

/**
 * Cuentas por pagar (S5.7): una por recepción de compra con total, con el
 * plazo del proveedor. Su saldo baja con los pagos al proveedor y con las
 * devoluciones a proveedor confirmadas.
 */
export const PAYABLE_STATUSES = ['OPEN', 'PAID'] as const
export type PayableStatus = (typeof PAYABLE_STATUSES)[number]

export const PAYABLE_STATUS_LABELS: Record<PayableStatus, string> = {
    OPEN: 'Pendiente',
    PAID: 'Pagada',
}

export const PAYABLE_STATUS_TONES: Record<PayableStatus, StatusTone> = {
    OPEN: 'warning',
    PAID: 'success',
}

/** Lo que bajó el saldo de una cuenta */
export const PAYABLE_APPLICATION_KINDS = ['PAYMENT', 'RETURN'] as const
export type PayableApplicationKind = (typeof PAYABLE_APPLICATION_KINDS)[number]

export const PAYABLE_APPLICATION_KIND_LABELS: Record<
    PayableApplicationKind,
    string
> = {
    PAYMENT: 'Pago',
    RETURN: 'Devolución',
}

export interface Payable {
    id: number
    supplierId: number
    supplierName?: string | null
    supplierTaxId?: string | null
    purchaseOrderId: number
    /** `PO-2026-0001` */
    orderNumber: string | null
    purchaseReceiptId: number
    /** La factura del proveedor de esa entrega */
    supplierInvoiceNumber: string | null
    /** Lo recibido con IVA */
    amount: number
    /** Lo que todavía se debe */
    balance: number
    /** `YYYY-MM-DD` */
    issuedOn: string
    dueOn: string
    termDays: number
    status: PayableStatus
    /** Días de vencida mientras está abierta; 0 si no vence todavía */
    daysOverdue: number
    createdAt: string | null
}

export interface PayableApplication {
    id: number
    kind: PayableApplicationKind
    amount: number
    appliedAt: string
    supplierPaymentId: number | null
    supplierReturnId: number | null
    /** `PP-2026-0001` o `DP-2026-0001` */
    documentNumber: string | null
    paymentMethod: PaymentMethod | null
}

export interface PayableDetail extends Payable {
    applications: PayableApplication[]
}

export interface PayableParams {
    supplierId?: number
    status?: PayableStatus
    purchaseOrderId?: number
    overdue?: boolean
    limit?: number
    offset?: number
}

export interface SupplierPaymentApplication {
    payableId: number
    purchaseOrderId: number
    supplierInvoiceNumber: string | null
    amount: number
    /** El saldo de la cuenta ahora */
    balance: number
}

export interface SupplierPaymentSummary {
    id: number
    /** `PP-2026-0001` */
    number: string | null
    supplierId: number
    supplierName: string | null
    amount: number
    paymentMethod: PaymentMethod
    reference: string | null
    notes: string | null
    paidAt: string
    paidBy: string | null
}

export interface SupplierPayment extends SupplierPaymentSummary {
    applications: SupplierPaymentApplication[]
}

export interface SupplierPaymentInput {
    supplierId: number
    amount: number
    /** Cualquiera menos CREDIT */
    paymentMethod: PaymentMethod
    reference?: string | null
    notes?: string | null
    /** Sin ellas, FIFO: primero la cuenta que vence antes */
    applications?: { payableId: number; amount: number }[]
}

/** Una devolución confirmada y lo que acreditó */
export interface SupplierReturnCredit {
    id: number
    /** `DP-2026-0001` */
    number: string | null
    purchaseOrderId: number
    orderNumber: string | null
    supplierCreditNoteNumber: string | null
    total: number
    creditedAmount: number
    /** Lo que el proveedor debe reembolsar */
    refundDue: number
    confirmedAt: string | null
}

export interface SupplierAccount {
    supplierId: number
    supplierName: string
    supplierTaxId: string
    /** Días */
    paymentTerms: number | null
    /** Lo que se le debe */
    outstanding: number
    overdue: number
    /** Cuentas abiertas, la que vence antes primero */
    payables: Payable[]
    /** Últimos pagos, el último primero */
    payments: SupplierPaymentSummary[]
    /** Últimas devoluciones confirmadas */
    returns: SupplierReturnCredit[]
}

/** Los medios con que se paga a un proveedor: todos menos el crédito; un
 *  cheque va como OTHER con su número en la referencia */
export const SUPPLIER_PAYMENT_METHODS = [
    'TRANSFER',
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'OTHER',
] as const satisfies readonly PaymentMethod[]

// El backend responde en inglés: estos casos los ve quien paga
export const PAYABLE_ERROR_MESSAGES: Record<string, string> = {
    SUPPLIER_PAYMENT_EXCEEDS_BALANCE:
        'El pago supera lo que se le debe al proveedor.',
    SUPPLIER_PAYMENT_APPLICATION_MISMATCH:
        'Lo aplicado a las cuentas debe sumar el pago, sin pasar el saldo de ninguna.',
    PAYABLE_NOT_OPEN:
        'Una de las cuentas ya no está pendiente. Actualiza y vuelve a intentar.',
    CREDIT_PAYMENT_NOT_ALLOWED: 'Un pago a proveedor no se hace con crédito.',
}
