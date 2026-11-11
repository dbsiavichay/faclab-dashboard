import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    PriceListInput,
    PriceListItemCreateInput,
    PriceListItemParams,
    PriceListItemUpdateInput,
    PriceListParams,
} from '../model/types'

export const PRICE_LISTS_KEY = ['priceLists'] as const

export const usePriceListsList = (params?: PriceListParams) =>
    useQuery({
        queryKey: [...PRICE_LISTS_KEY, 'list', params],
        queryFn: async () => {
            const response = await api.getPriceLists(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const usePriceList = (id: number) =>
    useQuery({
        queryKey: [...PRICE_LISTS_KEY, 'detail', id],
        queryFn: async () => (await api.getPriceList(id)).data,
        enabled: id > 0,
    })

export const usePriceListItems = (
    priceListId: number,
    params?: PriceListItemParams
) =>
    useQuery({
        queryKey: [...PRICE_LISTS_KEY, 'items', priceListId, params],
        queryFn: async () => {
            const response = await api.getPriceListItems(priceListId, params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        enabled: priceListId > 0,
        placeholderData: keepPreviousData,
    })

/** Cambiar una lista cambia los precios del POS: también los vuelve a pedir */
const useInvalidatePrices = () => {
    const qc = useQueryClient()
    return () => {
        qc.invalidateQueries({ queryKey: PRICE_LISTS_KEY })
        qc.invalidateQueries({ queryKey: ['pos', 'prices'] })
    }
}

export const usePriceListMutations = () => {
    const invalidate = useInvalidatePrices()
    return {
        create: useMutation({
            mutationFn: (data: PriceListInput) =>
                api.createPriceList(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({ id, data }: { id: number; data: PriceListInput }) =>
                api.updatePriceList(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deletePriceList(id),
            onSuccess: invalidate,
        }),
    }
}

export const usePriceListItemMutations = (priceListId: number) => {
    const invalidate = useInvalidatePrices()
    return {
        create: useMutation({
            mutationFn: (data: PriceListItemCreateInput) =>
                api.createPriceListItem(priceListId, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                itemId,
                data,
            }: {
                itemId: number
                data: PriceListItemUpdateInput
            }) =>
                api
                    .updatePriceListItem(priceListId, itemId, data)
                    .then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (itemId: number) =>
                api.deletePriceListItem(priceListId, itemId),
            onSuccess: invalidate,
        }),
    }
}
