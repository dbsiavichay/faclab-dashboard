export type Category = {
    id: number
    name: string
    description?: string | null
}

export type CategoryListParams = {
    search?: string
    page?: number
    limit?: number
    offset?: number
}
