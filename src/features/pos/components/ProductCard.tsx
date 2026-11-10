import { memo, useCallback, useState } from 'react'
import { HiOutlinePhotograph } from 'react-icons/hi'
import { formatCurrency } from '@shared/lib/format'
import type { ProductPresentation } from '@features/products'
import { usePOSStore } from '../store/usePOSStore'
import { sellablePresentations, toCartInput } from '../lib/cartLine'
import type { POSProduct } from '../model/types'
import PresentationPicker from './PresentationPicker'

interface ProductCardProps {
    product: POSProduct
}

const ProductCard = memo(({ product }: ProductCardProps) => {
    const addItem = usePOSStore((s) => s.addItem)
    const [picking, setPicking] = useState(false)
    const presentations = sellablePresentations(product)
    // Besides the base unit, a box or a roll: the cashier picks one (S5.2)
    const hasPresentations = presentations.some((p) => !p.isBase)

    const handleClick = useCallback(() => {
        if (hasPresentations) {
            setPicking(true)
            return
        }
        addItem(toCartInput(product))
    }, [addItem, product, hasPresentations])

    const handlePick = useCallback(
        (presentation: ProductPresentation) => {
            addItem(toCartInput(product, presentation))
            setPicking(false)
        },
        [addItem, product]
    )

    return (
        <>
            <button
                type="button"
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-card transition duration-150 hover:border-primary-400 hover:shadow-pop active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:shadow-none"
                onClick={handleClick}
            >
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100 dark:bg-gray-700/60">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <HiOutlinePhotograph
                            aria-hidden="true"
                            className="text-4xl text-gray-300 dark:text-gray-500"
                        />
                    )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-1 p-3">
                    <p className="line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                        {product.name}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">
                        {formatCurrency(product.salePrice ?? 0)}
                    </p>
                    {hasPresentations && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            También por{' '}
                            {presentations
                                .filter((p) => !p.isBase)
                                .map((p) => p.name)
                                .join(', ')}
                        </p>
                    )}
                </div>
            </button>
            {hasPresentations && (
                <PresentationPicker
                    product={product}
                    presentations={presentations}
                    isOpen={picking}
                    onClose={() => setPicking(false)}
                    onPick={handlePick}
                />
            )}
        </>
    )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
