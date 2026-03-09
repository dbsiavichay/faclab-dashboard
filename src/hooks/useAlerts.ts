import { useQuery } from '@tanstack/react-query'
import AlertService, {
    type StockAlertQueryParams,
    type ExpiringLotsQueryParams,
} from '@/services/AlertService'

export function useLowStock(params?: StockAlertQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'low-stock', params],
        queryFn: async () => {
            const response = await AlertService.getLowStock(params)
            return response.data.data
        },
    })
}

export function useOutOfStock(params?: StockAlertQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'out-of-stock', params],
        queryFn: async () => {
            const response = await AlertService.getOutOfStock(params)
            return response.data.data
        },
    })
}

export function useReorderPoint(params?: StockAlertQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'reorder-point', params],
        queryFn: async () => {
            const response = await AlertService.getReorderPoint(params)
            return response.data.data
        },
    })
}

export function useExpiringLots(params?: ExpiringLotsQueryParams) {
    return useQuery({
        queryKey: ['alerts', 'expiring-lots', params],
        queryFn: async () => {
            const response = await AlertService.getExpiringLots(params)
            return response.data.data
        },
    })
}
