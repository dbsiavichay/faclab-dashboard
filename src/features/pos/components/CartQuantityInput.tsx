import { useState } from 'react'
import Input from '@/components/ui/Input'
import {
    decimalsHint,
    fitsDecimals,
    formatQuantity,
    parseQuantity,
} from '@shared/lib/quantity'
import { usePOSStore, type POSCartItem } from '../store/usePOSStore'

interface CartQuantityInputProps {
    item: POSCartItem
}

/**
 * La cantidad de una línea del carrito, editable (S5.1): 2,5 m de cable o
 * 1,25 kg de clavos. Acepta coma o punto y los decimales de la unidad del
 * producto; se aplica al salir del campo o con Enter, y Escape la descarta.
 */
const CartQuantityInput = ({ item }: CartQuantityInputProps) => {
    const updateItemQuantity = usePOSStore((s) => s.updateItemQuantity)
    const [draft, setDraft] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const discard = () => {
        setDraft(null)
        setError(null)
    }

    const commit = () => {
        if (draft === null) return
        const quantity = parseQuantity(draft)
        if (quantity === null || quantity < 0) {
            setError('Cantidad inválida')
            return
        }
        if (!fitsDecimals(quantity, item.quantityDecimals)) {
            setError(decimalsHint(item.quantityDecimals))
            return
        }
        // Cero quita la línea, como el botón de disminuir
        updateItemQuantity(item.lineKey, quantity)
        discard()
    }

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
                <Input
                    size="sm"
                    inputMode="decimal"
                    autoComplete="off"
                    className="w-16 text-center tabular-nums"
                    aria-label={`Cantidad de ${item.name}`}
                    value={draft ?? formatQuantity(item.quantity)}
                    invalid={error !== null}
                    onChange={(e) => {
                        setDraft(e.target.value)
                        setError(null)
                    }}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commit()
                        if (e.key === 'Escape') discard()
                    }}
                />
                {/* A box is counted in boxes; its units go in the line's name */}
                {item.unitSymbol && !item.presentationId && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.unitSymbol}
                    </span>
                )}
            </div>
            {error && (
                <span role="alert" className="mt-0.5 text-xs text-red-500">
                    {error}
                </span>
            )}
        </div>
    )
}

export default CartQuantityInput
