import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import PurchaseOrderService, {
    type PurchaseOrderInput,
    type PurchaseOrderUpdateInput,
    type PurchaseOrderQueryParams,
    type PurchaseOrderItemInput,
    type PurchaseOrderItemUpdateInput,
    type ReceiveInput,
} from '@/services/PurchaseOrderService'

// --- Purchase Orders ---

export function usePurchaseOrders(params?: PurchaseOrderQueryParams) {
    return useQuery({
        queryKey: ['purchaseOrders', params],
        queryFn: async () => {
            const response = await PurchaseOrderService.getPurchaseOrders(
                params
            )
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function usePurchaseOrder(id: number) {
    return useQuery({
        queryKey: ['purchaseOrders', id],
        queryFn: async () => {
            const response = await PurchaseOrderService.getPurchaseOrder(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useCreatePurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PurchaseOrderInput) => {
            const response = await PurchaseOrderService.createPurchaseOrder(
                data
            )
            return response.data.data
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
            const response = await PurchaseOrderService.updatePurchaseOrder(
                id,
                data
            )
            return response.data.data
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
        mutationFn: (id: number) =>
            PurchaseOrderService.deletePurchaseOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
        },
    })
}

export function useSendPurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await PurchaseOrderService.sendPurchaseOrder(id)
            return response.data.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrders', id],
            })
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
        },
    })
}

export function useCancelPurchaseOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await PurchaseOrderService.cancelPurchaseOrder(id)
            return response.data.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: ['purchaseOrders', id],
            })
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
            const response = await PurchaseOrderService.receivePurchaseOrder(
                id,
                data
            )
            return response.data.data
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
            const response = await PurchaseOrderService.getPurchaseOrderItems(
                orderId
            )
            return response.data.data
        },
        enabled: orderId > 0,
    })
}

export function useAddPurchaseOrderItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PurchaseOrderItemInput) => {
            const response = await PurchaseOrderService.addPurchaseOrderItem(
                data
            )
            return response.data.data
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
            const response = await PurchaseOrderService.updatePurchaseOrderItem(
                itemId,
                data
            )
            return response.data.data
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
            await PurchaseOrderService.deletePurchaseOrderItem(itemId)
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
            const response =
                await PurchaseOrderService.getPurchaseOrderReceipts(orderId)
            return response.data.data
        },
        enabled: orderId > 0,
    })
}
