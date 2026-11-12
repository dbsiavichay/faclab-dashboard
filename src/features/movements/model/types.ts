// Values defined by faclab-core
export const MOVEMENT_TYPES = ['IN', 'OUT'] as const
export type MovementType = (typeof MOVEMENT_TYPES)[number]

export interface Movement {
    id: number
    productId: number
    quantity: number
    type: MovementType
    locationId?: number | null
    reason?: string | null
    date?: string | null
    // Per base unit it moved at: an OUT, its location's average cost (S5.6)
    unitCost: number
}

export interface MovementInput {
    productId: number
    quantity: number
    type: MovementType
    reason?: string
    date?: string
    // Only for an IN (e.g. an initial balance); without it the IN enters at
    // the location's average cost
    unitCost?: number
}

export interface MovementListParams {
    productId?: number
    type?: MovementType
    fromDate?: string
    toDate?: string
    limit?: number
    offset?: number
}
