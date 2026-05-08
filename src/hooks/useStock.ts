import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getStock, type StockQueryParams } from '@/services/StockService'

export function useStock(params?: StockQueryParams) {
    return useQuery({
        queryKey: ['stock', params],
        queryFn: async () => {
            const body = await getStock(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}
