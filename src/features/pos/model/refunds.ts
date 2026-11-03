import type { POSSale, Refund, RefundItem } from './types'

/**
 * Tiene factura autorizada o en camino: una devolución suya genera una nota de
 * crédito, y por eso necesita motivo (el XML lo exige)
 */
export const saleHasInvoice = (
    sale: Pick<POSSale, 'status' | 'invoiceStatus'>
): boolean => sale.status === 'INVOICED' || sale.invoiceStatus === 'PENDING'

/**
 * La factura a consumidor final no se anula ni admite nota de crédito
 * (NAC-DGERCGC25-00000014, art. 3): el core rechaza esa devolución, aquí se avisa
 * antes de elegir nada
 */
export const invoicedToFinalConsumer = (
    sale: Pick<POSSale, 'status' | 'invoiceStatus' | 'customerId'>
): boolean => sale.customerId === null && saleHasInvoice(sale)

/** Cuánto se devolvió ya de cada ítem de la venta, sin las devoluciones canceladas */
export const refundedQuantities = (
    refunds: (Pick<Refund, 'status'> & {
        items?: Pick<RefundItem, 'originalSaleItemId' | 'quantity'>[]
    })[]
): Map<number, number> => {
    const refunded = new Map<number, number>()
    for (const refund of refunds) {
        if (refund.status === 'CANCELLED') continue
        for (const item of refund.items ?? []) {
            refunded.set(
                item.originalSaleItemId,
                (refunded.get(item.originalSaleItemId) ?? 0) + item.quantity
            )
        }
    }
    return refunded
}
