import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { usePOSStore } from '@/stores/usePOSStore'
import type { POSCartItem } from '@/stores/usePOSStore'
import {
    HiMinus,
    HiPlus,
    HiOutlineTrash,
    HiOutlinePencil,
} from 'react-icons/hi'

interface OrderItemRowProps {
    item: POSCartItem
}

const OrderItemRow = ({ item }: OrderItemRowProps) => {
    const { updateItemQuantity, removeItem, updateItemPrice } = usePOSStore()
    const [editingPrice, setEditingPrice] = useState(false)
    const [newPrice, setNewPrice] = useState('')

    const lineTotal = item.salePrice * item.quantity * (1 - item.discount / 100)

    const handlePriceSubmit = () => {
        const price = parseFloat(newPrice)
        if (price > 0) {
            updateItemPrice(item.productId, price)
        }
        setEditingPrice(false)
        setNewPrice('')
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            ${item.salePrice.toFixed(2)}
                            {item.discount > 0 && (
                                <span className="text-red-500 ml-1">
                                    -{item.discount}%
                                </span>
                            )}
                        </p>
                        <button
                            className="text-gray-400 hover:text-primary-500"
                            onClick={() => {
                                setNewPrice(item.salePrice.toString())
                                setEditingPrice(!editingPrice)
                            }}
                        >
                            <HiOutlinePencil className="text-xs" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        size="xs"
                        variant="plain"
                        icon={<HiMinus />}
                        onClick={() =>
                            updateItemQuantity(
                                item.productId,
                                item.quantity - 1
                            )
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
                            updateItemQuantity(
                                item.productId,
                                item.quantity + 1
                            )
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

            {editingPrice && (
                <div className="flex items-center gap-2 pl-1">
                    <Input
                        size="sm"
                        type="number"
                        value={newPrice}
                        prefix="$"
                        placeholder="Nuevo precio"
                        className="w-32"
                        onChange={(e) => setNewPrice(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePriceSubmit()
                            if (e.key === 'Escape') setEditingPrice(false)
                        }}
                    />
                    <Button
                        size="xs"
                        variant="solid"
                        onClick={handlePriceSubmit}
                    >
                        OK
                    </Button>
                    <Button
                        size="xs"
                        variant="plain"
                        onClick={() => setEditingPrice(false)}
                    >
                        Cancelar
                    </Button>
                </div>
            )}
        </div>
    )
}

export default OrderItemRow
