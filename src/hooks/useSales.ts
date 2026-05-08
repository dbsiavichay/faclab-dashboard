import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
    getSales,
    getSale,
    getSaleItems,
    getSalePayments,
    type SaleQueryParams,
} from '@/services/SaleService'

export function useSales(params?: SaleQueryParams) {
    return useQuery({
        queryKey: ['sales', params],
        queryFn: async () => {
            const body = await getSales(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useSale(id: number) {
    return useQuery({
        queryKey: ['sales', id],
        queryFn: async () => {
            const body = await getSale(id)
            return body.data
        },
        enabled: id > 0,
    })
}

export function useSaleItems(saleId: number) {
    return useQuery({
        queryKey: ['saleItems', saleId],
        queryFn: async () => {
            const body = await getSaleItems(saleId)
            return body.data
        },
        enabled: saleId > 0,
    })
}

export function useSalePayments(saleId: number) {
    return useQuery({
        queryKey: ['salePayments', saleId],
        queryFn: async () => {
            const body = await getSalePayments(saleId)
            return body.data
        },
        enabled: saleId > 0,
    })
}
