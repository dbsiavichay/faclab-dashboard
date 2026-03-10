import { useQuery, keepPreviousData } from '@tanstack/react-query'
import ReportService, {
    type ValuationParams,
    type RotationParams,
    type MovementHistoryParams,
    type SummaryParams,
} from '@/services/ReportService'

export function useValuation(params?: ValuationParams) {
    return useQuery({
        queryKey: ['reports', 'valuation', params],
        queryFn: async () => {
            const response = await ReportService.getValuation(params)
            return response.data.data
        },
    })
}

export function useRotation(params?: RotationParams) {
    return useQuery({
        queryKey: ['reports', 'rotation', params],
        queryFn: async () => {
            const response = await ReportService.getRotation(params)
            return response.data.data
        },
    })
}

export function useMovementHistory(params?: MovementHistoryParams) {
    return useQuery({
        queryKey: ['reports', 'movements', params],
        queryFn: async () => {
            const response = await ReportService.getMovementHistory(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useWarehouseSummary(params?: SummaryParams) {
    return useQuery({
        queryKey: ['reports', 'summary', params],
        queryFn: async () => {
            const response = await ReportService.getWarehouseSummary(params)
            return response.data.data
        },
    })
}
