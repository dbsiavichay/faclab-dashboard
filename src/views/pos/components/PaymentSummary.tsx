import {
    usePOSStore,
    getCartSubtotal,
    getCartDiscountAmount,
    getCartTotal,
} from '@/stores/usePOSStore'

const PaymentSummary = () => {
    const { cartItems, discountType, discountValue } = usePOSStore()

    const subtotal = getCartSubtotal(cartItems)
    const discountAmount = getCartDiscountAmount(
        subtotal,
        discountType,
        discountValue
    )
    const total = getCartTotal(cartItems, discountType, discountValue)

    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                    Subtotal
                </span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                        Descuento
                        {discountType === 'PERCENTAGE' &&
                            ` (${discountValue}%)`}
                    </span>
                    <span className="text-red-500">
                        -${discountAmount.toFixed(2)}
                    </span>
                </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
            </div>
        </div>
    )
}

export default PaymentSummary
