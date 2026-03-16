import { usePOSStore } from '@/stores/usePOSStore'
import OrderItemRow from './OrderItemRow'
import CustomerSelector from './CustomerSelector'
import PaymentSummary from './PaymentSummary'
import ActionButtons from './ActionButtons'
import { HiOutlineShoppingCart } from 'react-icons/hi'

interface OrderPanelProps {
    onPayment: () => void
    onDiscount: () => void
    onHold: () => void
    onViewOrders: () => void
}

const OrderPanel = ({
    onPayment,
    onDiscount,
    onHold,
    onViewOrders,
}: OrderPanelProps) => {
    const { cartItems } = usePOSStore()

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg">Lista de Orden</h3>
            </div>

            <CustomerSelector />

            <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <HiOutlineShoppingCart className="text-4xl mb-2" />
                        <p className="text-sm">Carrito vacio</p>
                        <p className="text-xs">
                            Seleccione productos para agregar
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <OrderItemRow key={item.productId} item={item} />
                        ))}
                    </div>
                )}
            </div>

            <PaymentSummary />

            <ActionButtons
                onPayment={onPayment}
                onDiscount={onDiscount}
                onHold={onHold}
                onViewOrders={onViewOrders}
            />
        </div>
    )
}

export default OrderPanel
