import { useQuery } from '@tanstack/react-query'
import StockService, { Stock, StockQueryParams } from '@/services/StockService'

export function useStock(params?: StockQueryParams) {
    return useQuery({
        queryKey: ['stock', params],
        queryFn: async () => {
            const response = await StockService.getStock(params)
            return response.data
        },
    })
}
