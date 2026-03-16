import Button from '@/components/ui/Button'
import { usePOSStore } from '@/stores/usePOSStore'
import type { POSCartItem } from '@/stores/usePOSStore'
import { HiMinus, HiPlus, HiOutlineTrash } from 'react-icons/hi'

interface OrderItemRowProps {
    item: POSCartItem
}

const OrderItemRow = ({ item }: OrderItemRowProps) => {
    const { updateItemQuantity, removeItem } = usePOSStore()

    const lineTotal = item.salePrice * item.quantity * (1 - item.discount / 100)

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    ${item.salePrice.toFixed(2)}
                    {item.discount > 0 && (
                        <span className="text-red-500 ml-1">
                            -{item.discount}%
                        </span>
                    )}
                </p>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    size="xs"
                    variant="plain"
                    icon={<HiMinus />}
                    onClick={() =>
                        updateItemQuantity(item.productId, item.quantity - 1)
                    }
                />
                <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                </span>
                <Button
                    size="xs"
                    variant="plain"
                    icon={<HiPlus />}
                    onClick={() =>
                        updateItemQuantity(item.productId, item.quantity + 1)
                    }
                />
            </div>

            <span className="text-sm font-medium w-16 text-right">
                ${lineTotal.toFixed(2)}
            </span>

            <Button
                size="xs"
                variant="plain"
                icon={<HiOutlineTrash className="text-red-500" />}
                onClick={() => removeItem(item.productId)}
            />
        </div>
    )
}

export default OrderItemRow
