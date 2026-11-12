export type Stock = {
    id: number
    productId: number
    productName: string | null
    quantity: number
    locationId: number | null
    locationName: string | null
    reservedQuantity: number
    // Weighted average cost per base unit in this location (S5.6)
    averageCost: number
}

export type StockListParams = {
    productId?: number
    limit?: number
    offset?: number
}
