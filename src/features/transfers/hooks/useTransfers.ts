import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    TransferInput,
    TransferUpdateInput,
    TransferListParams,
    TransferItemInput,
    TransferItemUpdateInput,
} from '../model/types'

const KEY = ['transfers'] as const

export const useTransfersList = (params?: TransferListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const body = await api.getTransfers(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })

export const useTransfer = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const body = await api.getTransfer(id)
            return body.data
        },
        enabled: id > 0,
    })

export const useTransferMutations = () => {
    const queryClient = useQueryClient()
    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY })
    const invalidateOne = (id: number) => {
        queryClient.invalidateQueries({ queryKey: [...KEY, id] })
        invalidate()
    }

    return {
        create: useMutation({
            mutationFn: async (data: TransferInput) => {
                const body = await api.createTransfer(data)
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
                data: TransferUpdateInput
            }) => {
                const body = await api.updateTransfer(id, data)
                return body.data
            },
            onSuccess: (_, variables) => invalidateOne(variables.id),
        }),
        remove: useMutation({
            mutationFn: (id: number) => api.deleteTransfer(id),
            onSuccess: invalidate,
        }),
        confirm: useMutation({
            mutationFn: async (id: number) => {
                const body = await api.confirmTransfer(id)
                return body.data
            },
            onSuccess: (_, id) => invalidateOne(id),
        }),
        receive: useMutation({
            mutationFn: async (id: number) => {
                const body = await api.receiveTransfer(id)
                return body.data
            },
            onSuccess: (_, id) => invalidateOne(id),
        }),
        cancel: useMutation({
            mutationFn: async (id: number) => {
                const body = await api.cancelTransfer(id)
                return body.data
            },
            onSuccess: (_, id) => invalidateOne(id),
        }),
    }
}

export const useTransferItems = (transferId: number) =>
    useQuery({
        queryKey: ['transferItems', transferId],
        queryFn: async () => {
            const body = await api.getTransferItems(transferId)
            return body.data
        },
        enabled: transferId > 0,
    })

export const useTransferItemMutations = (transferId: number) => {
    const queryClient = useQueryClient()
    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: ['transferItems', transferId],
        })

    return {
        add: useMutation({
            mutationFn: async (data: TransferItemInput) => {
                const body = await api.addTransferItem(transferId, data)
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
                data: TransferItemUpdateInput
            }) => {
                const body = await api.updateTransferItem(itemId, data)
                return body.data
            },
            onSuccess: invalidate,
        }),
        remove: useMutation({
            mutationFn: (itemId: number) => api.deleteTransferItem(itemId),
            onSuccess: invalidate,
        }),
    }
}
