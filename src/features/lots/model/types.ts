import type { PaginationParams } from '@/@types/api'

export type Lot = {
    id: number
    lotNumber: string
    productId: number
    initialQuantity: number
    currentQuantity: number
    manufactureDate?: string | null
    expirationDate?: string | null
    isExpired: boolean
    daysToExpiry?: number | null
    notes?: string | null
    createdAt: string
    updatedAt: string
}

export type LotInput = {
    lotNumber: string
    productId: number
    initialQuantity: number
    manufactureDate?: string
    expirationDate?: string
    notes?: string
}

export type LotUpdateInput = {
    currentQuantity?: number
    manufactureDate?: string
    expirationDate?: string
    notes?: string
}

export type LotListParams = PaginationParams & {
    productId?: number
    expiringInDays?: number
}
