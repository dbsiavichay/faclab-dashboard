import { useQuery, keepPreviousData } from '@tanstack/react-query'
import * as api from '../api/client'
import type { StockListParams } from '../model/types'

const KEY = ['stock'] as const

export const useStockList = (params?: StockListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getStock(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })
