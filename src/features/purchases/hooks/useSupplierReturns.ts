import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import * as api from '../api/supplierReturns'
import type {
    SupplierReturnInput,
    SupplierReturnItemInput,
    SupplierReturnItemUpdateInput,
    SupplierReturnListParams,
} from '../model/types'

export const SUPPLIER_RETURNS_KEY = ['supplierReturns'] as const

export const useSupplierReturns = (params?: SupplierReturnListParams) =>
    useQuery({
        queryKey: [...SUPPLIER_RETURNS_KEY, params],
        queryFn: async () => {
            const body = await api.getSupplierReturns(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })

export const useSupplierReturn = (id: number) =>
    useQuery({
        queryKey: [...SUPPLIER_RETURNS_KEY, id],
        queryFn: async () => (await api.getSupplierReturn(id)).data,
        enabled: id > 0,
    })

export const useSupplierReturnItems = (id: number) =>
    useQuery({
        queryKey: ['supplierReturnItems', id],
        queryFn: async () => (await api.getSupplierReturnItems(id)).data,
        enabled: id > 0,
    })

export const useSupplierReturnMutations = () => {
    const queryClient = useQueryClient()
    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: SUPPLIER_RETURNS_KEY })

    return {
        create: useMutation({
            mutationFn: async (data: SupplierReturnInput) =>
                (await api.createSupplierReturn(data)).data,
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: async ({
                id,
                notes,
            }: {
                id: number
                notes: string | null
            }) => (await api.updateSupplierReturn(id, { notes })).data,
            onSuccess: invalidate,
        }),
        remove: useMutation({
            mutationFn: (id: number) => api.deleteSupplierReturn(id),
            onSuccess: invalidate,
        }),
        confirm: useMutation({
            mutationFn: async ({
                id,
                supplierCreditNoteNumber,
            }: {
                id: number
                supplierCreditNoteNumber?: string | null
            }) =>
                (
                    await api.confirmSupplierReturn(id, {
                        supplierCreditNoteNumber,
                    })
                ).data,
            // Stock, the order's returned quantities and what is owed change
            onSuccess: () => {
                invalidate()
                queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
                queryClient.invalidateQueries({
                    queryKey: ['purchaseOrderItems'],
                })
                queryClient.invalidateQueries({ queryKey: ['payables'] })
                queryClient.invalidateQueries({
                    queryKey: ['supplierAccounts'],
                })
            },
        }),
    }
}

export const useSupplierReturnItemMutations = (supplierReturnId: number) => {
    const queryClient = useQueryClient()
    // The lines and the return's totals
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: ['supplierReturnItems', supplierReturnId],
        })
        queryClient.invalidateQueries({ queryKey: SUPPLIER_RETURNS_KEY })
    }

    return {
        add: useMutation({
            mutationFn: async (data: SupplierReturnItemInput) =>
                (await api.addSupplierReturnItem(supplierReturnId, data)).data,
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: async ({
                itemId,
                data,
            }: {
                itemId: number
                data: SupplierReturnItemUpdateInput
            }) => (await api.updateSupplierReturnItem(itemId, data)).data,
            onSuccess: invalidate,
        }),
        remove: useMutation({
            mutationFn: (itemId: number) =>
                api.deleteSupplierReturnItem(itemId),
            onSuccess: invalidate,
        }),
    }
}
