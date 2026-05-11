export type LocationType = 'STORAGE' | 'RECEIVING' | 'SHIPPING' | 'RETURN'

export type Location = {
    id: number
    warehouseId: number
    name: string
    code: string
    type: LocationType
    isActive: boolean
    capacity?: number | null
}

export type LocationListParams = {
    warehouseId?: number
    isActive?: boolean
    limit?: number
    offset?: number
}
