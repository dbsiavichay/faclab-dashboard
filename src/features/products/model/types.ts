import type { PaginationParams } from '@/@types/api'
import type {
    ConstructionMaterialCode,
    TaxCode,
} from '@/constants/tax.constant'

/**
 * A way of selling or buying a product (S5.2): its base unit (factor 1, the
 * product's barcode and prices) and others like a box of 100 or a roll of 50 m.
 */
export type ProductPresentation = {
    id: number
    productId: number
    name: string
    /** Base units in one presentation, greater than zero */
    factor: number
    /** Unique in the company among every presentation */
    barcode: string | null
    /** Its own price; null: factor × the product's */
    salePrice: number | null
    purchasePrice: number | null
    isBase: boolean
    isActive: boolean
    /** What a sale and a purchase order take by default */
    effectiveSalePrice: number | null
    effectivePurchasePrice: number | null
    /** Decimals a quantity in it takes: the unit's minus the factor's */
    quantityDecimals: number
}

export type ProductPresentationInput = {
    name: string
    factor: number
    barcode?: string | null
    salePrice?: number | null
    purchasePrice?: number | null
    isActive?: boolean
}

export type Product = {
    id: number
    name: string
    sku: string
    description: string | null
    /** Barcode of the base unit, kept in its base presentation */
    barcode: string | null
    categoryId: number | null
    /** Base unit, the one stock is kept in (required since S5.2) */
    unitOfMeasureId: number
    purchasePrice: number | null
    salePrice: number | null
    taxCode: TaxCode
    constructionMaterialCode: ConstructionMaterialCode | null
    isActive: boolean
    isService: boolean
    minStock: number
    maxStock: number | null
    reorderPoint: number
    leadTimeDays: number | null
    // Its unit of measure (S5.1): the decimals its quantities take
    unitSymbol: string | null
    quantityDecimals: number
    /** The base presentation first, then by factor */
    presentations: ProductPresentation[]
}

export type ProductInput = {
    name: string
    sku: string
    description?: string | null
    barcode?: string | null
    categoryId?: number | null
    unitOfMeasureId: number
    purchasePrice?: number | null
    salePrice?: number | null
    taxCode?: TaxCode
    constructionMaterialCode?: ConstructionMaterialCode | null
    isActive?: boolean
    isService?: boolean
    minStock?: number
    maxStock?: number | null
    reorderPoint?: number
    leadTimeDays?: number | null
}

export type ProductListParams = PaginationParams & {
    categoryId?: number
    /** Name or SKU containing the text, or the exact barcode of a presentation */
    search?: string
}
