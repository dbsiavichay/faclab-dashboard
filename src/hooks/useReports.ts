import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
    getValuation,
    getRotation,
    getMovementHistory,
    getWarehouseSummary,
    type ValuationParams,
    type RotationParams,
    type MovementHistoryParams,
    type SummaryParams,
} from '@/services/ReportService'

export function useValuation(params?: ValuationParams) {
    return useQuery({
        queryKey: ['reports', 'valuation', params],
        queryFn: async () => {
            const response = await getValuation(params)
            return response.data
        },
    })
}

export function useRotation(params?: RotationParams) {
    return useQuery({
        queryKey: ['reports', 'rotation', params],
        queryFn: async () => {
            const response = await getRotation(params)
            return response.data
        },
    })
}

export function useMovementHistory(params?: MovementHistoryParams) {
    return useQuery({
        queryKey: ['reports', 'movements', params],
        queryFn: async () => {
            const body = await getMovementHistory(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useWarehouseSummary(params?: SummaryParams) {
    return useQuery({
        queryKey: ['reports', 'summary', params],
        queryFn: async () => {
            const response = await getWarehouseSummary(params)
            return response.data
        },
    })
}
