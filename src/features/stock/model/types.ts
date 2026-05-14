export type Stock = {
    id: number
    productId: number
    quantity: number
    location?: string | null
}

export type StockListParams = {
    productId?: number
    limit?: number
    offset?: number
}
