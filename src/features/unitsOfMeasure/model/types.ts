import type { PaginationParams } from '@/@types/api'

export type UnitOfMeasure = {
    id: number
    name: string
    symbol: string
    description?: string | null
    isActive: boolean
    // Decimales que admite una cantidad en esta unidad (S5.1): 0 = enteras
    decimals: number
}

export type UnitOfMeasureInput = {
    name: string
    symbol: string
    description?: string | null
    isActive?: boolean
    decimals?: number
    [key: string]: unknown
}

export type UnitOfMeasureListParams = PaginationParams & {
    isActive?: boolean
}
