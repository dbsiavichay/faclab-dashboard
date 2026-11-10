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
    // Presentation price; selling at another one is an override with a reason
    listPrice: number
    overrideReason?: string
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

interface POSState {
    cartItems: POSCartItem[]
    customerId: number | null
    customerName: string | null
    isFinalConsumer: boolean

    discountType: 'PERCENTAGE' | 'AMOUNT' | null
    discountValue: number

    selectedCategoryId: number | null
    searchTerm: string

    /** Adds one of the product (or of its presentation), or one more to its line */
    addItem: (product: CartProductInput) => void
    updateItemQuantity: (lineKey: string, quantity: number) => void
    updateItemDiscount: (lineKey: string, discount: number) => void
    updateItemPrice: (lineKey: string, price: number, reason?: string) => void
    removeItem: (lineKey: string) => void
    setCustomer: (id: number | null, name: string | null) => void
    setFinalConsumer: (value: boolean) => void
    applyDiscount: (type: 'PERCENTAGE' | 'AMOUNT', value: number) => void
    clearDiscount: () => void
    clearCart: () => void
    setSelectedCategory: (categoryId: number | null) => void
    setSearchTerm: (term: string) => void
}

export const usePOSStore = create<POSState>()((set) => ({
    cartItems: [],
    customerId: null,
    customerName: null,
    isFinalConsumer: false,

    discountType: null,
    discountValue: 0,

    selectedCategoryId: null,
    searchTerm: '',

    addItem: (product) =>
        set((state) => {
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
        set((state) => ({
            cartItems: state.cartItems.map((item) =>
                item.lineKey === lineKey ? { ...item, discount } : item
            ),
        })),

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

    removeItem: (lineKey) =>
        set((state) => ({
            cartItems: state.cartItems.filter(
                (item) => item.lineKey !== lineKey
            ),
        })),

    setCustomer: (id, name) =>
        set({
            customerId: id,
            customerName: name,
            isFinalConsumer: false,
        }),

    setFinalConsumer: (value) => set({ isFinalConsumer: value }),

    applyDiscount: (type, value) =>
        set({ discountType: type, discountValue: value }),

    clearDiscount: () => set({ discountType: null, discountValue: 0 }),

    clearCart: () =>
        set({
            cartItems: [],
            customerId: null,
            customerName: null,
            isFinalConsumer: false,
            discountType: null,
            discountValue: 0,
        }),

    setSelectedCategory: (categoryId) =>
        set({ selectedCategoryId: categoryId }),

    setSearchTerm: (term) => set({ searchTerm: term }),
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
