import type { StatusTone } from '@shared/lib/statusTone'
import type { TaxCode } from '@/constants/tax.constant'

/**
 * Cotización (S5.4): la proforma que una sucursal entrega para una obra. Se
 * numera al crearla, sus ítems toman los precios de las listas del cliente y se
 * cobra en el POS como una venta con sus mismos ítems. No reserva stock.
 */
export type QuoteStatus =
    | 'DRAFT'
    | 'SENT'
    | 'ACCEPTED'
    | 'EXPIRED'
    | 'CONVERTED'

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
    DRAFT: 'Borrador',
    SENT: 'Enviada',
    ACCEPTED: 'Aceptada',
    EXPIRED: 'Vencida',
    CONVERTED: 'Convertida',
}

export const QUOTE_STATUS_TONES: Record<QuoteStatus, StatusTone> = {
    DRAFT: 'neutral',
    SENT: 'info',
    ACCEPTED: 'warning',
    EXPIRED: 'danger',
    CONVERTED: 'success',
}

/** Las que todavía se envían, aceptan o cobran mientras rigen */
export const OPEN_QUOTE_STATUSES: readonly QuoteStatus[] = [
    'DRAFT',
    'SENT',
    'ACCEPTED',
]

export interface QuoteSummary {
    id: number
    /** Correlativo de la sucursal (`COT-001-000012`) */
    number: string | null
    branchId: number
    branchName: string | null
    establishmentCode: string | null
    /** Null: consumidor final */
    customerId: number | null
    customerName: string | null
    customerTaxId: string | null
    customerEmail: string | null
    status: QuoteStatus
    /** `YYYY-MM-DD` */
    issueDate: string
    /** Último día en que rige (`YYYY-MM-DD`) */
    validUntil: string
    subtotal: number
    tax: number
    total: number
    notes: string | null
    createdBy: string | null
    sentAt: string | null
    acceptedAt: string | null
    convertedAt: string | null
}

export interface QuoteItem {
    id: number
    quoteId: number
    productId: number
    productName: string | null
    productSku: string | null
    presentationId: number | null
    presentationName: string | null
    /** En su presentación, como el precio */
    quantity: number
    unitFactor: number
    baseQuantity: number
    /** El de sus listas: una cotización no lleva precios a mano */
    unitPrice: number
    discount: number
    taxCode: TaxCode
    taxAmount: number
    subtotal: number
}

export interface Quote extends QuoteSummary {
    items: QuoteItem[]
    /** La venta en que se convirtió */
    saleId: number | null
    saleNumber: string | null
}

export interface QuoteInput {
    branchId: number
    customerId: number | null
    validUntil: string
    notes: string | null
}

export type QuoteUpdateInput = Omit<QuoteInput, 'branchId'>

export interface QuoteItemInput {
    productId: number
    /** Sin ella, la unidad base */
    presentationId?: number | null
    quantity: number
    discount: number
}

export interface QuoteItemUpdateInput {
    quantity: number
    discount: number
}

export interface QuoteParams {
    status?: QuoteStatus
    customerId?: number
    number?: string
    limit?: number
    offset?: number
}

/** Una cotización vencida por fecha aunque el worker aún no la marque */
export const isExpired = (
    quote: Pick<QuoteSummary, 'status' | 'validUntil'>,
    today: string
): boolean =>
    quote.status === 'EXPIRED' ||
    (OPEN_QUOTE_STATUSES.includes(quote.status) && quote.validUntil < today)

/** Hoy como `YYYY-MM-DD` local, para comparar con las fechas de una cotización */
export const localDay = (date: Date = new Date()): string => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}`
}

/** Un día `YYYY-MM-DD` más `days` días */
export const addDays = (day: string, days: number): string => {
    const date = new Date(`${day}T00:00:00`)
    date.setDate(date.getDate() + days)
    return localDay(date)
}

// El backend responde en inglés: estos casos los ve quien cotiza
export const QUOTE_ERROR_MESSAGES: Record<string, string> = {
    INVALID_QUOTE_STATUS:
        'La cotización ya no está en un estado que lo permita.',
    QUOTE_WITHOUT_ITEMS: 'Agrega al menos un ítem a la cotización.',
    QUOTE_EXPIRED: 'La cotización venció: renuévala para usarla.',
    QUOTE_EMAIL_REQUIRED:
        'Indica el correo: el cliente no tiene uno registrado.',
    EMAIL_DISABLED: 'El envío de correos no está habilitado.',
    EMAIL_DELIVERY_FAILED:
        'El servidor de correo no aceptó el mensaje. Intenta de nuevo más tarde.',
    PRODUCT_WITHOUT_PRICE:
        'El producto no tiene precio en las listas del cliente ni uno propio.',
    BRANCH_INACTIVE: 'La sucursal está desactivada.',
}
