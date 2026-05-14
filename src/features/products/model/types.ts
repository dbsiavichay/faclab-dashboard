import type { PaginationParams } from '@/@types/api'

export type Product = {
    id: number
    name: string
    sku: string
    description: string | null
    barcode: string | null
    categoryId: number | null
    unitOfMeasureId: number | null
    purchasePrice: number | null
    salePrice: number | null
    isActive: boolean
    isService: boolean
    minStock: number
    maxStock: number | null
    reorderPoint: number
    leadTimeDays: number | null
}

export type ProductInput = {
    name: string
    sku: string
    description?: string | null
    barcode?: string | null
    categoryId?: number | null
    unitOfMeasureId?: number | null
    purchasePrice?: number | null
    salePrice?: number | null
    isActive?: boolean
    isService?: boolean
    minStock?: number
    maxStock?: number | null
    reorderPoint?: number
    leadTimeDays?: number | null
}

export type ProductListParams = PaginationParams & {
    categoryId?: number
}
