import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    AdjustmentInput,
    AdjustmentUpdateInput,
    AdjustmentListParams,
    AdjustmentItemInput,
    AdjustmentItemUpdateInput,
} from '../model/types'

const KEY = ['adjustments'] as const

export const useAdjustmentsList = (params?: AdjustmentListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const body = await api.getAdjustments(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })

export const useAdjustment = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const body = await api.getAdjustment(id)
            return body.data
        },
        enabled: id > 0,
    })

export const useAdjustmentMutations = () => {
    const queryClient = useQueryClient()
    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY })
    const invalidateOne = (id: number) => {
        queryClient.invalidateQueries({ queryKey: [...KEY, id] })
        invalidate()
    }

    return {
        create: useMutation({
            mutationFn: async (data: AdjustmentInput) => {
                const body = await api.createAdjustment(data)
                return body.data
            },
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: async ({
                id,
                data,
            }: {
                id: number
                data: AdjustmentUpdateInput
            }) => {
                const body = await api.updateAdjustment(id, data)
                return body.data
            },
            onSuccess: (_, variables) => invalidateOne(variables.id),
        }),
        remove: useMutation({
            mutationFn: (id: number) => api.deleteAdjustment(id),
            onSuccess: invalidate,
        }),
        confirm: useMutation({
            mutationFn: async (id: number) => {
                const body = await api.confirmAdjustment(id)
                return body.data
            },
            onSuccess: (_, id) => invalidateOne(id),
        }),
        cancel: useMutation({
            mutationFn: async (id: number) => {
                const body = await api.cancelAdjustment(id)
                return body.data
            },
            onSuccess: (_, id) => invalidateOne(id),
        }),
    }
}

export const useAdjustmentItems = (adjustmentId: number) =>
    useQuery({
        queryKey: ['adjustmentItems', adjustmentId],
        queryFn: async () => {
            const body = await api.getAdjustmentItems(adjustmentId)
            return body.data
        },
        enabled: adjustmentId > 0,
    })

export const useAdjustmentItemMutations = (adjustmentId: number) => {
    const queryClient = useQueryClient()
    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: ['adjustmentItems', adjustmentId],
        })

    return {
        add: useMutation({
            mutationFn: async (data: AdjustmentItemInput) => {
                const body = await api.addAdjustmentItem(adjustmentId, data)
                return body.data
            },
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: async ({
                itemId,
                data,
            }: {
                itemId: number
                data: AdjustmentItemUpdateInput
            }) => {
                const body = await api.updateAdjustmentItem(itemId, data)
                return body.data
            },
            onSuccess: invalidate,
        }),
        remove: useMutation({
            mutationFn: (itemId: number) => api.deleteAdjustmentItem(itemId),
            onSuccess: invalidate,
        }),
    }
}
