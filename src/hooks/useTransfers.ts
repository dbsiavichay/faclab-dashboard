import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getTransfers,
    getTransfer,
    createTransfer,
    updateTransfer,
    deleteTransfer,
    confirmTransfer,
    receiveTransfer,
    cancelTransfer,
    getTransferItems,
    addTransferItem,
    updateTransferItem,
    deleteTransferItem,
    type TransferInput,
    type TransferUpdateInput,
    type TransferQueryParams,
    type TransferItemInput,
    type TransferItemUpdateInput,
} from '@/services/TransferService'

// --- Transfers ---

export function useTransfers(params?: TransferQueryParams) {
    return useQuery({
        queryKey: ['transfers', params],
        queryFn: async () => {
            const body = await getTransfers(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useTransfer(id: number) {
    return useQuery({
        queryKey: ['transfers', id],
        queryFn: async () => {
            const body = await getTransfer(id)
            return body.data
        },
        enabled: id > 0,
    })
}

export function useCreateTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: TransferInput) => {
            const body = await createTransfer(data)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfers'] })
        },
    })
}

export function useUpdateTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: TransferUpdateInput
        }) => {
            const body = await updateTransfer(id, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['transfers', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['transfers'] })
        },
    })
}

export function useDeleteTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteTransfer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfers'] })
        },
    })
}

export function useConfirmTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await confirmTransfer(id)
            return body.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: ['transfers', id],
            })
            queryClient.invalidateQueries({ queryKey: ['transfers'] })
        },
    })
}

export function useReceiveTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await receiveTransfer(id)
            return body.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: ['transfers', id],
            })
            queryClient.invalidateQueries({ queryKey: ['transfers'] })
        },
    })
}

export function useCancelTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await cancelTransfer(id)
            return body.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: ['transfers', id],
            })
            queryClient.invalidateQueries({ queryKey: ['transfers'] })
        },
    })
}

// --- Transfer Items ---

export function useTransferItems(transferId: number) {
    return useQuery({
        queryKey: ['transferItems', transferId],
        queryFn: async () => {
            const body = await getTransferItems(transferId)
            return body.data
        },
        enabled: transferId > 0,
    })
}

export function useAddTransferItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            transferId,
            data,
        }: {
            transferId: number
            data: TransferItemInput
        }) => {
            const body = await addTransferItem(transferId, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['transferItems', variables.transferId],
            })
        },
    })
}

export function useUpdateTransferItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            itemId,
            data,
        }: {
            itemId: number
            transferId: number
            data: TransferItemUpdateInput
        }) => {
            const body = await updateTransferItem(itemId, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['transferItems', variables.transferId],
            })
        },
    })
}

export function useDeleteTransferItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            itemId,
        }: {
            itemId: number
            transferId: number
        }) => {
            await deleteTransferItem(itemId)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['transferItems', variables.transferId],
            })
        },
    })
}
