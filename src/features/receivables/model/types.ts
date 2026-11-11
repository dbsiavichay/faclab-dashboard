import type { PaymentMethod } from '@features/sales'
import type { StatusTone } from '@shared/lib/statusTone'

/**
 * Cuentas por cobrar (S5.5): una por venta a crédito, con el plazo del cliente.
 * Su saldo baja con los abonos (en la caja de un turno o fuera de ella) y con
 * las devoluciones de la venta, que se acreditan primero a la cuenta.
 */
export const RECEIVABLE_STATUSES = ['OPEN', 'PAID', 'CANCELLED'] as const
export type ReceivableStatus = (typeof RECEIVABLE_STATUSES)[number]

export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
    OPEN: 'Pendiente',
    PAID: 'Pagada',
    CANCELLED: 'Anulada',
}

export const RECEIVABLE_STATUS_TONES: Record<ReceivableStatus, StatusTone> = {
    OPEN: 'warning',
    PAID: 'success',
    CANCELLED: 'neutral',
}

/** Lo que bajó el saldo de una cuenta */
export const RECEIVABLE_APPLICATION_KINDS = ['PAYMENT', 'REFUND'] as const
export type ReceivableApplicationKind =
    (typeof RECEIVABLE_APPLICATION_KINDS)[number]

export const RECEIVABLE_APPLICATION_KIND_LABELS: Record<
    ReceivableApplicationKind,
    string
> = {
    PAYMENT: 'Abono',
    REFUND: 'Devolución',
}

/** Tramos de antigüedad por días de vencido, en el orden en que se muestran */
export const AGING_BUCKETS = [
    'notDue',
    'days1To30',
    'days31To60',
    'days61To90',
    'over90',
] as const
export type AgingBucket = (typeof AGING_BUCKETS)[number]

export const AGING_BUCKET_LABELS: Record<AgingBucket, string> = {
    notDue: 'Por vencer',
    days1To30: '1 a 30 días',
    days31To60: '31 a 60 días',
    days61To90: '61 a 90 días',
    over90: 'Más de 90 días',
}

export const AGING_BUCKET_TONES: Record<AgingBucket, StatusTone> = {
    notDue: 'success',
    days1To30: 'info',
    days31To60: 'warning',
    days61To90: 'warning',
    over90: 'danger',
}

export interface Receivable {
    id: number
    customerId: number
    customerName?: string | null
    customerTaxId?: string | null
    saleId: number
    /** `V-001-000123` */
    saleNumber: string | null
    branchId: number | null
    /** Lo que la venta dejó a crédito */
    amount: number
    /** Lo que todavía se debe */
    balance: number
    /** `YYYY-MM-DD` */
    issuedOn: string
    dueOn: string
    termDays: number
    status: ReceivableStatus
    cancelledAt: string | null
    /** Días de vencida mientras está abierta; 0 si todavía no vence */
    daysOverdue: number
}

export interface ReceivableApplication {
    id: number
    kind: ReceivableApplicationKind
    amount: number
    appliedAt: string
    customerPaymentId: number | null
    refundId: number | null
    /** El número del abono (`AB-2026-0001`) o de la devolución */
    documentNumber: string | null
    paymentMethod: PaymentMethod | null
}

export interface ReceivableDetail extends Receivable {
    applications: ReceivableApplication[]
}

export interface ReceivableParams {
    customerId?: number
    status?: ReceivableStatus
    overdue?: boolean
    branchId?: number
    limit?: number
    offset?: number
}

export type AgingTotals = Record<AgingBucket, number> & { total: number }

export interface AgingRow extends AgingTotals {
    customerId: number
    customerName: string
    customerTaxId: string
    /** Cuentas abiertas */
    receivables: number
}

export interface Aging {
    /** `YYYY-MM-DD`: los tramos se cuentan a hoy */
    asOf: string
    customers: AgingRow[]
    totals: AgingTotals
}

export interface CustomerAccount {
    customerId: number
    customerName: string
    customerTaxId: string
    /** Null: sin cupo */
    creditLimit: number | null
    /** Días */
    paymentTerms: number | null
    /** Activo y con cupo: compra a crédito */
    hasCredit: boolean
    outstanding: number
    overdue: number
    /** Cupo menos lo que debe */
    available: number
    /** Las abiertas, la que vence antes primero */
    receivables: Receivable[]
}

export const STATEMENT_LINE_TYPES = [
    'SALE',
    'PAYMENT',
    'REFUND',
    'CANCELLATION',
] as const
export type StatementLineType = (typeof STATEMENT_LINE_TYPES)[number]

export const STATEMENT_LINE_LABELS: Record<StatementLineType, string> = {
    SALE: 'Venta a crédito',
    PAYMENT: 'Abono',
    REFUND: 'Devolución',
    CANCELLATION: 'Venta anulada',
}

export interface StatementLine {
    type: StatementLineType
    id: number
    date: string
    documentNumber: string | null
    /** Cargo: una venta a crédito */
    charge: number
    /** Abono a la cuenta: abonos, devoluciones y anulaciones */
    credit: number
    /** Lo que el cliente debe después de la línea */
    balance: number
    receivableId: number | null
    saleId: number | null
    customerPaymentId: number | null
    refundId: number | null
    dueOn: string | null
    paymentMethod: PaymentMethod | null
}

export interface Statement {
    customerId: number
    customerName: string
    customerTaxId: string
    fromDate: string | null
    toDate: string | null
    openingBalance: number
    lines: StatementLine[]
    closingBalance: number
}

export interface StatementParams {
    fromDate?: string
    toDate?: string
}

export interface CustomerPaymentApplication {
    receivableId: number
    saleId: number
    saleNumber: string | null
    amount: number
    /** El saldo de la cuenta ahora */
    balance: number
}

export interface CustomerPaymentSummary {
    id: number
    /** `AB-2026-0001` */
    number: string | null
    customerId: number
    customerName: string | null
    amount: number
    paymentMethod: PaymentMethod
    reference: string | null
    notes: string | null
    paidAt: string
    receivedBy: string | null
    branchId: number | null
    terminalId: number | null
    /** El turno cuya caja lo recibió, en el POS */
    shiftId: number | null
}

export interface CustomerPayment extends CustomerPaymentSummary {
    applications: CustomerPaymentApplication[]
}

export interface CustomerPaymentInput {
    customerId: number
    amount: number
    /** Cualquiera menos CREDIT */
    paymentMethod: PaymentMethod
    reference?: string | null
    notes?: string | null
    /** Sin ellas, FIFO: primero la cuenta que vence antes */
    applications?: { receivableId: number; amount: number }[]
}

/** Los medios con que se abona: todos menos el crédito */
export const PAYMENT_ON_ACCOUNT_METHODS = [
    'CASH',
    'TRANSFER',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'OTHER',
] as const satisfies readonly PaymentMethod[]

// El backend responde en inglés: estos casos los ve quien vende o abona
export const RECEIVABLE_ERROR_MESSAGES: Record<string, string> = {
    CREDIT_LIMIT_EXCEEDED: 'El crédito supera el cupo disponible del cliente.',
    CUSTOMER_WITHOUT_CREDIT:
        'El cliente no compra a crédito: está inactivo o no tiene cupo.',
    CREDIT_CUSTOMER_REQUIRED:
        'Selecciona un cliente: el consumidor final no compra a crédito.',
    CUSTOMER_PAYMENT_EXCEEDS_BALANCE: 'El abono supera lo que el cliente debe.',
    PAYMENT_APPLICATION_MISMATCH:
        'Lo aplicado a las cuentas debe sumar el abono, sin pasar el saldo de ninguna.',
    RECEIVABLE_NOT_OPEN:
        'Una de las cuentas ya no está pendiente. Actualiza y vuelve a intentar.',
    CREDIT_PAYMENT_NOT_ALLOWED: 'Un abono no se paga con crédito.',
    RECEIVABLE_HAS_PAYMENTS:
        'La venta tiene abonos en su cuenta: haz una devolución en lugar de anularla.',
    NO_OPEN_SHIFT: 'Abre un turno en la caja para recibir el abono.',
}
