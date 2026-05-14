import { useQuery } from '@tanstack/react-query'
import * as api from '../api/client'
import type { StockAlertParams, ExpiringLotsParams } from '../model/types'

const KEY = ['alerts'] as const

export const useLowStock = (params?: StockAlertParams) =>
    useQuery({
        queryKey: [...KEY, 'low-stock', params],
        queryFn: async () => {
            const response = await api.getLowStock(params)
            return response.data
        },
    })

export const useOutOfStock = (params?: StockAlertParams) =>
    useQuery({
        queryKey: [...KEY, 'out-of-stock', params],
        queryFn: async () => {
            const response = await api.getOutOfStock(params)
            return response.data
        },
    })

export const useReorderPoint = (params?: StockAlertParams) =>
    useQuery({
        queryKey: [...KEY, 'reorder-point', params],
        queryFn: async () => {
            const response = await api.getReorderPoint(params)
            return response.data
        },
    })

export const useExpiringLots = (params?: ExpiringLotsParams) =>
    useQuery({
        queryKey: [...KEY, 'expiring-lots', params],
        queryFn: async () => {
            const response = await api.getExpiringLots(params)
            return response.data
        },
    })
