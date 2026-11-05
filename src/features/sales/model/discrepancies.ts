import { isFinalInvoice, onlyInvoices, type Invoice } from '@features/invoicing'
import type { InvoiceDiscrepancy } from './types'

/** La factura más reciente que faclab-invoicing tiene de la venta: sus notas de
 * crédito no cuentan */
export const latestInvoice = (documents: Invoice[]): Invoice | null =>
    onlyInvoices(documents).reduce<Invoice | null>(
        (latest, invoice) =>
            !latest || invoice.createdAt > latest.createdAt ? invoice : latest,
        null
    )

export interface DiscrepancyActions {
    /** Reenviar la venta: facturación no la tiene, se la rechazaron o ya la
     * autorizó y el core no recibió el resultado (el reenvío lo repite) */
    resend: boolean
    /** Reintentar en facturación la factura que sigue en curso */
    retry: Invoice | null
    review: boolean
    /** Emitir la nota de crédito de la factura autorizada de una venta anulada */
    creditNote: boolean
    /** Esa factura es a consumidor final: no admite nota de crédito */
    creditNoteNotAllowed: boolean
}

/**
 * Qué se puede hacer con una discrepancia según lo que facturación tiene de su
 * venta (`invoices`; undefined mientras no se sabe o si no responde: solo se
 * puede marcar revisada)
 */
export function discrepancyActions(
    discrepancy: InvoiceDiscrepancy,
    invoices: Invoice[] | undefined
): DiscrepancyActions {
    const review = discrepancy.status === 'open'
    const onCancelled =
        discrepancy.kind === 'authorized_on_cancelled' &&
        discrepancy.status !== 'resolved' &&
        !discrepancy.creditNote
    const finalConsumer = discrepancy.sale?.customerId === null
    const credit = {
        creditNote: onCancelled && !finalConsumer,
        creditNoteNotAllowed: onCancelled && finalConsumer,
    }
    const waiting =
        discrepancy.kind === 'confirmed_without_result' &&
        discrepancy.status !== 'resolved' &&
        discrepancy.sale?.status === 'CONFIRMED'
    if (!waiting || invoices === undefined) {
        return { resend: false, retry: null, review, ...credit }
    }
    const inProgress = onlyInvoices(invoices).find(
        (invoice) => !isFinalInvoice(invoice)
    )
    return { resend: !inProgress, retry: inProgress ?? null, review, ...credit }
}
