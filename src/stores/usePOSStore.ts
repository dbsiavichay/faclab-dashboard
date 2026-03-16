import { create } from 'zustand'

export interface POSCartItem {
    productId: number
    name: string
    sku: string
    salePrice: number
    quantity: number
    discount: number
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

    addItem: (product: {
        productId: number
        name: string
        sku: string
        salePrice: number
    }) => void
    updateItemQuantity: (productId: number, quantity: number) => void
    updateItemDiscount: (productId: number, discount: number) => void
    removeItem: (productId: number) => void
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
    isFinalConsumer: true,

    discountType: null,
    discountValue: 0,

    selectedCategoryId: null,
    searchTerm: '',

    addItem: (product) =>
        set((state) => {
            const existing = state.cartItems.find(
                (item) => item.productId === product.productId
            )
            if (existing) {
                return {
                    cartItems: state.cartItems.map((item) =>
                        item.productId === product.productId
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                }
            }
            return {
                cartItems: [
                    ...state.cartItems,
                    { ...product, quantity: 1, discount: 0 },
                ],
            }
        }),

    updateItemQuantity: (productId, quantity) =>
        set((state) => {
            if (quantity <= 0) {
                return {
                    cartItems: state.cartItems.filter(
                        (item) => item.productId !== productId
                    ),
                }
            }
            return {
                cartItems: state.cartItems.map((item) =>
                    item.productId === productId ? { ...item, quantity } : item
                ),
            }
        }),

    updateItemDiscount: (productId, discount) =>
        set((state) => ({
            cartItems: state.cartItems.map((item) =>
                item.productId === productId ? { ...item, discount } : item
            ),
        })),

    removeItem: (productId) =>
        set((state) => ({
            cartItems: state.cartItems.filter(
                (item) => item.productId !== productId
            ),
        })),

    setCustomer: (id, name) =>
        set({
            customerId: id,
            customerName: name,
            isFinalConsumer: id === null,
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
            isFinalConsumer: true,
            discountType: null,
            discountValue: 0,
        }),

    setSelectedCategory: (categoryId) =>
        set({ selectedCategoryId: categoryId }),

    setSearchTerm: (term) => set({ searchTerm: term }),
}))

export function getCartSubtotal(items: POSCartItem[]): number {
    return items.reduce((sum, item) => {
        const lineTotal =
            item.salePrice * item.quantity * (1 - item.discount / 100)
        return sum + lineTotal
    }, 0)
}

export function getCartDiscountAmount(
    subtotal: number,
    discountType: 'PERCENTAGE' | 'AMOUNT' | null,
    discountValue: number
): number {
    if (!discountType) return 0
    if (discountType === 'PERCENTAGE') return subtotal * (discountValue / 100)
    return discountValue
}

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
    return Math.max(0, subtotal - discount)
}
