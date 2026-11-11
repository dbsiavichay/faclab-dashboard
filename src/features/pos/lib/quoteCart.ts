import { cartLineKey, type POSCartItem } from '../store/usePOSStore'
import type { POSProduct, PosQuote, PosQuoteItem } from '../model/types'
import { toCartInput } from './cartLine'

/** Which price a changed line is charged at (S5.4): the quoted one or today's */
export type QuotePriceChoice = 'quoted' | 'current'

/** The lines whose quoted price isn't today's: the cashier chooses */
export const changedPriceLines = (quote: PosQuote): PosQuoteItem[] =>
    quote.items.filter((item) => item.priceChanged)

/** The lines the terminal's location can't cover (stock is not reserved) */
export const shortLines = (quote: PosQuote): PosQuoteItem[] =>
    quote.items.filter((item) => !item.enoughStock)

/** The override reason of a quoted price kept at the POS */
export const quoteReason = (quote: Pick<PosQuote, 'number' | 'id'>): string =>
    `Cotización ${quote.number ?? `#${quote.id}`}`

/**
 * The cart lines of a quote: its products in their presentations, with its
 * quantities and discounts. A line whose price changed takes the quoted one
 * as an override with its reason (`quoted`) or today's (`current`); the rest
 * take today's, which is the quoted one. faclab-core charges the quote only
 * with these same lines.
 */
export function quoteCartLines(
    quote: PosQuote,
    products: Map<number, POSProduct>,
    choice: QuotePriceChoice
): POSCartItem[] {
    const used = new Set<string>()
    return quote.items.map((item, index) => {
        const product = products.get(item.productId)
        if (!product) {
            throw new Error(`Product ${item.productId} of the quote not found`)
        }
        const presentation = product.presentations?.find(
            (p) => p.id === item.presentationId
        )
        const input = toCartInput(product, presentation)
        const listPrice = item.listPrice ?? item.unitPrice
        const keepQuoted = choice === 'quoted' && item.priceChanged
        // Two lines of the same presentation stay apart, as in the quote
        let lineKey = cartLineKey(item.productId, input.presentationId)
        if (used.has(lineKey)) lineKey = `${lineKey}#${index}`
        used.add(lineKey)
        return {
            ...input,
            lineKey,
            salePrice: keepQuoted ? item.unitPrice : listPrice,
            listPrice,
            overrideReason: keepQuoted ? quoteReason(quote) : undefined,
            priceListName: item.priceListName,
            unitSymbol: input.unitSymbol ?? null,
            quantityDecimals: input.quantityDecimals ?? 0,
            presentationId: input.presentationId ?? null,
            presentationName: input.presentationName ?? null,
            unitFactor: input.unitFactor ?? 1,
            quantity: item.quantity,
            discount: item.discount,
        }
    })
}
