import { create } from 'zustand'
import { type TaxCode } from '@/constants/tax.constant'
import { roundMoney } from '@shared/lib/money'
import { roundQuantity } from '@shared/lib/quantity'
import { discountFactor, taxBreakdown } from '../model/totals'

export interface POSCartItem {
    /** Product and presentation: a box and a unit of the same product are two lines */
    lineKey: string
    productId: number
    name: string
    sku: string
    /** Price of one unit of its presentation (one box) */
    salePrice: number
    // Price of its list (S5.3: the customer's, the branch's or the general one,
    // as faclab-core resolves it); selling at another one is an override with
    // a reason
    listPrice: number
    overrideReason?: string
    /** The list that gave `listPrice`; null: the product's price */
    priceListName?: string | null
    taxCode: TaxCode
    // Decimal (S5.1): in its presentation, up to the decimals it takes
    quantity: number
    discount: number
    unitSymbol: string | null
    quantityDecimals: number
    /** Presentation it is sold in (S5.2); null: the base unit */
    presentationId: number | null
    presentationName: string | null
    /** Base units in one of its presentation: stock moves quantity × it */
    unitFactor: number
}

/** The key of a cart line: product and presentation (`base` for the unit) */
export const cartLineKey = (
    productId: number,
    presentationId?: number | null
): string => `${productId}:${presentationId ?? 'base'}`

export const isPriceOverridden = (item: POSCartItem): boolean =>
    item.salePrice !== item.listPrice

/** The list price faclab-core gave a line, for the quantity it had then */
export interface CartLinePrice {
    lineKey: string
    quantity: number
    unitPrice: number | null
    priceListName: string | null
}

/** What a line is added with: a product, in its base unit or a presentation */
export interface CartProductInput {
    productId: number
    name: string
    sku: string
    salePrice: number
    taxCode: TaxCode
    // Defaults to salePrice (no override)
    listPrice?: number
    overrideReason?: string
    // The product's unit; a presentation takes its own decimals
    unitSymbol?: string | null
    quantityDecimals?: number
    // A presentation other than the base unit (S5.2)
    presentationId?: number | null
    presentationName?: string | null
    unitFactor?: number
}

/** The quote the cart charges (S5.4): its lines and customer stay as quoted */
export interface CartQuote {
    id: number
    number: string
}

interface POSState {
    cartItems: POSCartItem[]
    /** The quote being charged; null: a plain sale */
    quote: CartQuote | null
    customerId: number | null
    customerName: string | null
    isFinalConsumer: boolean

    discountType: 'PERCENTAGE' | 'AMOUNT' | null
    discountValue: number

    selectedCategoryId: number | null
    searchTerm: string
    /** The cart's list prices are being asked for: don't charge yet (S5.3) */
    pricesPending: boolean

    /** Adds one of the product (or of its presentation), or one more to its line */
    addItem: (product: CartProductInput) => void
    updateItemQuantity: (lineKey: string, quantity: number) => void
    updateItemDiscount: (lineKey: string, discount: number) => void
    updateItemPrice: (lineKey: string, price: number, reason?: string) => void
    /**
     * The list prices of the lines (S5.3). A line without an override takes
     * its new list price; an overridden one keeps its price and reason. A line
     * whose quantity changed since waits for the next answer.
     */
    applyResolvedPrices: (prices: CartLinePrice[]) => void
    setPricesPending: (pending: boolean) => void
    removeItem: (lineKey: string) => void
    setCustomer: (id: number | null, name: string | null) => void
    setFinalConsumer: (value: boolean) => void
    applyDiscount: (type: 'PERCENTAGE' | 'AMOUNT', value: number) => void
    clearDiscount: () => void
    clearCart: () => void
    setSelectedCategory: (categoryId: number | null) => void
    setSearchTerm: (term: string) => void
    /**
     * Replaces the cart with a quote's lines and customer (S5.4). While it is
     * loaded its lines, quantities, discounts and customer don't change
     * (faclab-core charges the quote only with its same items); prices do.
     */
    loadQuote: (
        quote: CartQuote,
        customer: { id: number; name: string } | null,
        lines: POSCartItem[]
    ) => void
    /** Keeps the lines as a plain sale, editable */
    clearQuote: () => void
}

export const usePOSStore = create<POSState>()((set) => ({
    cartItems: [],
    quote: null,
    customerId: null,
    customerName: null,
    isFinalConsumer: false,

    discountType: null,
    discountValue: 0,

    selectedCategoryId: null,
    searchTerm: '',
    pricesPending: false,

    addItem: (product) =>
        set((state) => {
            if (state.quote) return {}
            const presentationId = product.presentationId ?? null
            const lineKey = cartLineKey(product.productId, presentationId)
            const existing = state.cartItems.find(
                (item) => item.lineKey === lineKey
            )
            if (existing) {
                return {
                    cartItems: state.cartItems.map((item) =>
                        item.lineKey === lineKey
                            ? {
                                  ...item,
                                  quantity: roundQuantity(item.quantity + 1),
                              }
                            : item
                    ),
                }
            }
            return {
                cartItems: [
                    ...state.cartItems,
                    {
                        ...product,
                        lineKey,
                        listPrice: product.listPrice ?? product.salePrice,
                        unitSymbol: product.unitSymbol ?? null,
                        quantityDecimals: product.quantityDecimals ?? 0,
                        presentationId,
                        presentationName: product.presentationName ?? null,
                        unitFactor: product.unitFactor ?? 1,
                        quantity: 1,
                        discount: 0,
                    },
                ],
            }
        }),

    updateItemQuantity: (lineKey, quantity) =>
        set((state) => {
            if (state.quote) return {}
            if (quantity <= 0) {
                return {
                    cartItems: state.cartItems.filter(
                        (item) => item.lineKey !== lineKey
                    ),
                }
            }
            return {
                cartItems: state.cartItems.map((item) =>
                    item.lineKey === lineKey
                        ? { ...item, quantity: roundQuantity(quantity) }
                        : item
                ),
            }
        }),

    updateItemDiscount: (lineKey, discount) =>
        set((state) =>
            state.quote
                ? {}
                : {
                      cartItems: state.cartItems.map((item) =>
                          item.lineKey === lineKey
                              ? { ...item, discount }
                              : item
                      ),
                  }
        ),

    updateItemPrice: (lineKey, price, reason) =>
        set((state) => ({
            cartItems: state.cartItems.map((item) =>
                item.lineKey === lineKey
                    ? {
                          ...item,
                          salePrice: price,
                          overrideReason:
                              price === item.listPrice ? undefined : reason,
                      }
                    : item
            ),
        })),

    applyResolvedPrices: (prices) =>
        set((state) => {
            const byLine = new Map(prices.map((p) => [p.lineKey, p]))
            return {
                cartItems: state.cartItems.map((item) => {
                    const resolved = byLine.get(item.lineKey)
                    if (
                        !resolved ||
                        resolved.unitPrice === null ||
                        resolved.quantity !== item.quantity
                    ) {
                        return item
                    }
                    const listPrice = resolved.unitPrice
                    const overridden =
                        item.overrideReason !== undefined &&
                        item.salePrice !== listPrice
                    return {
                        ...item,
                        listPrice,
                        priceListName: resolved.priceListName,
                        salePrice: overridden ? item.salePrice : listPrice,
                        overrideReason: overridden
                            ? item.overrideReason
                            : undefined,
                    }
                }),
            }
        }),

    setPricesPending: (pending) => set({ pricesPending: pending }),

    removeItem: (lineKey) =>
        set((state) =>
            state.quote
                ? {}
                : {
                      cartItems: state.cartItems.filter(
                          (item) => item.lineKey !== lineKey
                      ),
                  }
        ),

    setCustomer: (id, name) =>
        set((state) =>
            state.quote
                ? {}
                : { customerId: id, customerName: name, isFinalConsumer: false }
        ),

    setFinalConsumer: (value) =>
        set((state) => (state.quote ? {} : { isFinalConsumer: value })),

    applyDiscount: (type, value) =>
        set({ discountType: type, discountValue: value }),

    clearDiscount: () => set({ discountType: null, discountValue: 0 }),

    clearCart: () =>
        set({
            cartItems: [],
            quote: null,
            customerId: null,
            customerName: null,
            isFinalConsumer: false,
            discountType: null,
            discountValue: 0,
        }),

    setSelectedCategory: (categoryId) =>
        set({ selectedCategoryId: categoryId }),

    setSearchTerm: (term) => set({ searchTerm: term }),

    loadQuote: (quote, customer, lines) =>
        set({
            quote,
            cartItems: lines,
            customerId: customer?.id ?? null,
            customerName: customer?.name ?? null,
            isFinalConsumer: customer === null,
            discountType: null,
            discountValue: 0,
        }),

    clearQuote: () => set({ quote: null }),
}))

/*
 * Totales del carrito. Replican `Sale.recalculate_totals` de faclab-core para que
 * el monto a cobrar coincida al centavo con el que valida el backend: las líneas
 * van a precisión completa y se redondean el subtotal, el descuento y el IVA
 * (por código), y total = subtotal - descuento + IVA.
 */

/** Monto de una línea (precio × cantidad × (1 - descuento_item%)), sin impuesto */
function lineSubtotal(item: POSCartItem): number {
    return item.salePrice * item.quantity * (1 - item.discount / 100)
}

/** Subtotal de items, sin impuesto, redondeado a centavos */
export function getCartSubtotal(items: POSCartItem[]): number {
    return roundMoney(items.reduce((sum, item) => sum + lineSubtotal(item), 0))
}

export function getCartDiscountAmount(
    subtotal: number,
    discountType: 'PERCENTAGE' | 'AMOUNT' | null,
    discountValue: number
): number {
    if (!discountType) return 0
    if (discountType === 'PERCENTAGE') {
        return roundMoney(subtotal * (discountValue / 100))
    }
    return Math.min(roundMoney(discountValue), subtotal)
}

/**
 * IVA sobre la base después del descuento de venta, que se prorratea entre los
 * items. Se redondea por código de IVA, como en la factura.
 */
export function getCartTax(
    items: POSCartItem[],
    discountType: 'PERCENTAGE' | 'AMOUNT' | null,
    discountValue: number
): number {
    const subtotal = getCartSubtotal(items)
    const discount = getCartDiscountAmount(
        subtotal,
        discountType,
        discountValue
    )
    const lines = items.map((item) => ({
        taxCode: item.taxCode,
        subtotal: lineSubtotal(item),
    }))
    return taxBreakdown(lines, discountFactor(subtotal, discount)).tax
}

/** Total = subtotal - descuento_venta + impuesto */
export function getCartTotal(
    items: POSCartItem[],
    discountType: 'PERCENTAGE' | 'AMOUNT' | null,
    discountValue: number
): number {
    const subtotal = getCartSubtotal(items)
    const discount = getCartDiscountAmount(
        subtotal,
        discountType,
        discountValue
    )
    const tax = getCartTax(items, discountType, discountValue)
    return roundMoney(subtotal - discount + tax)
}
