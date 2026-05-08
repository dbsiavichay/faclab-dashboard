import { useQuery } from '@tanstack/react-query'
import {
    getLowStock,
    getOutOfStock,
    getReorderPoint,
    getExpiringLots,
    type StockAlertQueryParams,
    type ExpiringLotsQueryParams,
} from '@/services/AlertService'

export function useLowStock(params?: StockAlertQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'low-stock', params],
        queryFn: async () => {
            const response = await getLowStock(params)
            return response.data
        },
    })
}

export function useOutOfStock(params?: StockAlertQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'out-of-stock', params],
        queryFn: async () => {
            const response = await getOutOfStock(params)
            return response.data
        },
    })
}

export function useReorderPoint(params?: StockAlertQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'reorder-point', params],
        queryFn: async () => {
            const response = await getReorderPoint(params)
            return response.data
        },
    })
}

export function useExpiringLots(params?: ExpiringLotsQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'expiring-lots', params],
        queryFn: async () => {
            const response = await getExpiringLots(params)
            return response.data
        },
    })
}
