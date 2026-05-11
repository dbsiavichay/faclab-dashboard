export type Warehouse = {
    id: number
    name: string
    code: string
    address?: string | null
    city?: string | null
    country?: string | null
    isActive: boolean
    isDefault: boolean
    manager?: string | null
    phone?: string | null
    email?: string | null
}

export type WarehouseListParams = {
    search?: string
    page?: number
    limit?: number
    offset?: number
    isActive?: boolean
}
