import { useQuery, keepPreviousData } from '@tanstack/react-query'
import SaleService, { type SaleQueryParams } from '@/services/SaleService'

export function useSales(params?: SaleQueryParams) {
    return useQuery({
        queryKey: ['sales', params],
        queryFn: async () => {
            const response = await SaleService.getSales(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useSale(id: number) {
    return useQuery({
        queryKey: ['sales', id],
        queryFn: async () => {
            const response = await SaleService.getSale(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useSaleItems(saleId: number) {
    return useQuery({
        queryKey: ['saleItems', saleId],
        queryFn: async () => {
            const response = await SaleService.getSaleItems(saleId)
            return response.data.data
        },
        enabled: saleId > 0,
    })
}

export function useSalePayments(saleId: number) {
    return useQuery({
        queryKey: ['salePayments', saleId],
        queryFn: async () => {
            const response = await SaleService.getSalePayments(saleId)
            return response.data.data
        },
        enabled: saleId > 0,
    })
}
