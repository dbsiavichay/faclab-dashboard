import Button from '@/components/ui/Button'
import { usePOSStore } from '@/stores/usePOSStore'

interface ActionButtonsProps {
    onPayment: () => void
    onDiscount: () => void
    onHold: () => void
    onViewOrders: () => void
}

const ActionButtons = ({
    onPayment,
    onDiscount,
    onHold,
    onViewOrders,
}: ActionButtonsProps) => {
    const { cartItems } = usePOSStore()
    const cartEmpty = cartItems.length === 0

    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2">
            <Button
                block
                variant="default"
                disabled={cartEmpty}
                onClick={onHold}
            >
                Retener
            </Button>
            <Button
                block
                variant="twoTone"
                disabled={cartEmpty}
                onClick={onDiscount}
            >
                Descuento
            </Button>
            <Button
                block
                variant="solid"
                disabled={cartEmpty}
                onClick={onPayment}
            >
                Cobrar
            </Button>
            <Button block variant="plain" onClick={onViewOrders}>
                Ordenes
            </Button>
        </div>
    )
}

export default ActionButtons
