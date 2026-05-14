export type MovementType = 'in' | 'out'

export interface Movement {
    id: number
    productId: number
    quantity: number
    type: MovementType
    reason?: string | null
    date?: string | null
}

export interface MovementInput {
    productId: number
    quantity: number
    type: MovementType
    reason?: string
    date?: string
}

export interface MovementListParams {
    productId?: number
    type?: MovementType
    fromDate?: string
    toDate?: string
    limit?: number
    offset?: number
}
