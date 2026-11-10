import type { ProductPresentation } from '@features/products'
import type { CartProductInput } from '../store/usePOSStore'
import type { POSProduct } from '../model/types'

/**
 * Las presentaciones en que se vende un producto (S5.2): la base (su unidad) y
 * las activas, como la caja de 100 o el rollo de 50 m.
 */
export function sellablePresentations(
    product: POSProduct
): ProductPresentation[] {
    return (product.presentations ?? []).filter((p) => p.isActive)
}

/**
 * La línea del carrito de un producto en una presentación: su precio (el propio
 * o factor × el del producto), sus decimales y su factor. La base, o ninguna,
 * es la unidad del producto.
 */
export function toCartInput(
    product: POSProduct,
    presentation?: ProductPresentation | null
): CartProductInput {
    const base = {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        taxCode: product.taxCode,
        unitSymbol: product.unitSymbol,
    }
    if (!presentation || presentation.isBase) {
        return {
            ...base,
            salePrice: product.salePrice ?? 0,
            quantityDecimals: product.quantityDecimals,
        }
    }
    return {
        ...base,
        salePrice: presentation.effectiveSalePrice ?? 0,
        quantityDecimals: presentation.quantityDecimals,
        presentationId: presentation.id,
        presentationName: presentation.name,
        unitFactor: presentation.factor,
    }
}
