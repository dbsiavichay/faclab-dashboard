import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    PurchaseOrderInput,
    PurchaseOrderUpdateInput,
    PurchaseOrderQueryParams,
    PurchaseOrderItemInput,
    PurchaseOrderItemUpdateInput,
    ReceiveInput,
} from '../model/types'

// --- Purchase Orders ---

export function usePurchaseOrders(params?: PurchaseOrderQueryParams) {
    return useQuery({
        queryKey: ['purchaseOrders', params],
        queryFn: async () => {
            const body = await api.getPurchaseOrders(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function usePurchaseOrder(id: number) {
    return useQuery({
        queryKey: ['purchaseOrders', id],
        queryFn: async () => {
            const body = await api.getPurchaseOrder(id)
            return body.data
        },
        enabled: id > 0,
    })
}

export function useCreatePurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PurchaseOrderInput) => {
            const body = await api.createPurchaseOrder(data)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
        },
    })
}

export function useUpdatePurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: PurchaseOrderUpdateInput
        }) => {
            const body = await api.updatePurchaseOrder(id, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrders', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
        },
    })
}

export function useDeletePurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => api.deletePurchaseOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
        },
    })
}

export function useSendPurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await api.sendPurchaseOrder(id)
            return body.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders', id] })
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
        },
    })
}

export function useCancelPurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await api.cancelPurchaseOrder(id)
            return body.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders', id] })
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
        },
    })
}

export function useReceivePurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: ReceiveInput
        }) => {
            const body = await api.receivePurchaseOrder(id, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrders', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrderItems', variables.id],
            })
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrderReceipts', variables.id],
            })
        },
    })
}

// --- Purchase Order Items ---

export function usePurchaseOrderItems(orderId: number) {
    return useQuery({
        queryKey: ['purchaseOrderItems', orderId],
        queryFn: async () => {
            const body = await api.getPurchaseOrderItems(orderId)
            return body.data
        },
        enabled: orderId > 0,
    })
}

export function useAddPurchaseOrderItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PurchaseOrderItemInput) => {
            const body = await api.addPurchaseOrderItem(data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrderItems', variables.purchaseOrderId],
            })
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrders', variables.purchaseOrderId],
            })
        },
    })
}

export function useUpdatePurchaseOrderItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            itemId,
            data,
        }: {
            itemId: number
            orderId: number
            data: PurchaseOrderItemUpdateInput
        }) => {
            const body = await api.updatePurchaseOrderItem(itemId, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrderItems', variables.orderId],
            })
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrders', variables.orderId],
            })
        },
    })
}

export function useDeletePurchaseOrderItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ itemId }: { itemId: number; orderId: number }) => {
            await api.deletePurchaseOrderItem(itemId)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrderItems', variables.orderId],
            })
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrders', variables.orderId],
            })
        },
    })
}

// --- Receipts ---

export function usePurchaseOrderReceipts(orderId: number) {
    return useQuery({
        queryKey: ['purchaseOrderReceipts', orderId],
        queryFn: async () => {
            const body = await api.getPurchaseOrderReceipts(orderId)
            return body.data
        },
        enabled: orderId > 0,
    })
}
