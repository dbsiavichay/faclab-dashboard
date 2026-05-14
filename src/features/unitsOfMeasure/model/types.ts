import type { PaginationParams } from '@/@types/api'

export type UnitOfMeasure = {
    id: number
    name: string
    symbol: string
    description?: string | null
    isActive: boolean
}

export type UnitOfMeasureInput = {
    name: string
    symbol: string
    description?: string | null
    isActive?: boolean
    [key: string]: unknown
}

export type UnitOfMeasureListParams = PaginationParams & {
    isActive?: boolean
}
