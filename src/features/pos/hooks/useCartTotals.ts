import { useMemo } from 'react'
import {
    usePOSStore,
    getCartSubtotal,
    getCartDiscountAmount,
    getCartTax,
    getCartTotal,
} from '../store/usePOSStore'

export function useCartTotals() {
    const cartItems = usePOSStore((s) => s.cartItems)
    const discountType = usePOSStore((s) => s.discountType)
    const discountValue = usePOSStore((s) => s.discountValue)

    return useMemo(() => {
        const subtotal = getCartSubtotal(cartItems)
        const discountAmount = getCartDiscountAmount(
            subtotal,
            discountType,
            discountValue
        )
        const tax = getCartTax(cartItems, discountType, discountValue)
        const total = getCartTotal(cartItems, discountType, discountValue)
        return { subtotal, discountAmount, tax, total }
    }, [cartItems, discountType, discountValue])
}
