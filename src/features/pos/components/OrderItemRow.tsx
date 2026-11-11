import { memo, useCallback, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { isPriceOverridden, usePOSStore } from '../store/usePOSStore'
import type { POSCartItem } from '../store/usePOSStore'
import {
    HiMinus,
    HiPlus,
    HiOutlineTrash,
    HiOutlinePencil,
} from 'react-icons/hi'
import { formatCurrency } from '@shared/lib/format'
import CartQuantityInput from './CartQuantityInput'

interface OrderItemRowProps {
    item: POSCartItem
}

const OrderItemRow = memo(({ item }: OrderItemRowProps) => {
    const updateItemQuantity = usePOSStore((s) => s.updateItemQuantity)
    // A quote's lines keep their quantities (S5.4)
    const locked = usePOSStore((s) => s.quote !== null)
    const removeItem = usePOSStore((s) => s.removeItem)
    const updateItemPrice = usePOSStore((s) => s.updateItemPrice)
    const [editingPrice, setEditingPrice] = useState(false)
    const [newPrice, setNewPrice] = useState('')
    const [reason, setReason] = useState('')
    const [reasonMissing, setReasonMissing] = useState(false)

    const lineTotal = item.salePrice * item.quantity * (1 - item.discount / 100)
    const parsedPrice = parseFloat(newPrice)
    const changesListPrice = parsedPrice > 0 && parsedPrice !== item.listPrice

    const handlePriceSubmit = useCallback(() => {
        const price = parseFloat(newPrice)
        if (!(price > 0)) return
        // faclab-core records why an item is sold at another price
        if (price !== item.listPrice && !reason.trim()) {
            setReasonMissing(true)
            return
        }
        updateItemPrice(item.lineKey, price, reason.trim() || undefined)
        setEditingPrice(false)
        setNewPrice('')
        setReasonMissing(false)
    }, [newPrice, reason, updateItemPrice, item.lineKey, item.listPrice])

    const handleToggleEdit = useCallback(() => {
        setNewPrice(item.salePrice.toString())
        setReason(item.overrideReason ?? '')
        setReasonMissing(false)
        setEditingPrice((prev) => !prev)
    }, [item.salePrice, item.overrideReason])

    const handleDecreaseQty = useCallback(
        () => updateItemQuantity(item.lineKey, item.quantity - 1),
        [updateItemQuantity, item.lineKey, item.quantity]
    )

    const handleIncreaseQty = useCallback(
        () => updateItemQuantity(item.lineKey, item.quantity + 1),
        [updateItemQuantity, item.lineKey, item.quantity]
    )

    const handleRemove = useCallback(
        () => removeItem(item.lineKey),
        [removeItem, item.lineKey]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') handlePriceSubmit()
            if (e.key === 'Escape') setEditingPrice(false)
        },
        [handlePriceSubmit]
    )

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {item.name}
                        {item.presentationName && (
                            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                                · {item.presentationName}
                            </span>
                        )}
                    </p>
                    <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isPriceOverridden(item) && (
                                <span
                                    className="line-through mr-1"
                                    title={item.overrideReason}
                                >
                                    {formatCurrency(item.listPrice)}
                                </span>
                            )}
                            {formatCurrency(item.salePrice)}
                            {item.discount > 0 && (
                                <span className="text-red-500 ml-1">
                                    -{item.discount}%
                                </span>
                            )}
                            {item.priceListName && !isPriceOverridden(item) && (
                                <span className="ml-1 text-primary-600 dark:text-primary-300">
                                    · {item.priceListName}
                                </span>
                            )}
                        </p>
                        <button
                            type="button"
                            className="rounded p-0.5 text-gray-400 hover:text-primary-600"
                            aria-label={`Cambiar precio de ${item.name}`}
                            aria-expanded={editingPrice}
                            onClick={handleToggleEdit}
                        >
                            <HiOutlinePencil className="text-xs" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        size="xs"
                        variant="plain"
                        aria-label={`Disminuir cantidad de ${item.name}`}
                        icon={<HiMinus />}
                        disabled={locked}
                        onClick={handleDecreaseQty}
                    />
                    <CartQuantityInput item={item} disabled={locked} />
                    <Button
                        size="xs"
                        variant="plain"
                        aria-label={`Aumentar cantidad de ${item.name}`}
                        icon={<HiPlus />}
                        disabled={locked}
                        onClick={handleIncreaseQty}
                    />
                </div>

                <span className="text-sm font-medium w-16 text-right">
                    {formatCurrency(lineTotal)}
                </span>

                <Button
                    size="xs"
                    variant="plain"
                    aria-label={`Quitar ${item.name}`}
                    icon={<HiOutlineTrash className="text-red-500" />}
                    disabled={locked}
                    onClick={handleRemove}
                />
            </div>

            {editingPrice && (
                <div className="flex flex-wrap items-center gap-2 pl-1">
                    <Input
                        size="sm"
                        type="number"
                        value={newPrice}
                        prefix="$"
                        placeholder="Nuevo precio"
                        className="w-32"
                        onChange={(e) => setNewPrice(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {changesListPrice && (
                        <Input
                            size="sm"
                            value={reason}
                            placeholder="Motivo del cambio de precio"
                            className="w-56"
                            invalid={reasonMissing}
                            onChange={(e) => {
                                setReason(e.target.value)
                                setReasonMissing(false)
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    )}
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
})

OrderItemRow.displayName = 'OrderItemRow'

export default OrderItemRow
