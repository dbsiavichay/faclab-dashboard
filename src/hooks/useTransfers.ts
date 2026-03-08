import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import TransferService, {
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
            const response = await TransferService.getTransfers(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useTransfer(id: number) {
    return useQuery({
        queryKey: ['transfers', id],
        queryFn: async () => {
            const response = await TransferService.getTransfer(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useCreateTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: TransferInput) => {
            const response = await TransferService.createTransfer(data)
            return response.data.data
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
            const response = await TransferService.updateTransfer(id, data)
            return response.data.data
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
        mutationFn: (id: number) => TransferService.deleteTransfer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfers'] })
        },
    })
}

export function useConfirmTransfer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await TransferService.confirmTransfer(id)
            return response.data.data
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
            const response = await TransferService.receiveTransfer(id)
            return response.data.data
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
            const response = await TransferService.cancelTransfer(id)
            return response.data.data
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
            const response = await TransferService.getTransferItems(transferId)
            return response.data.data
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
            const response = await TransferService.addTransferItem(
                transferId,
                data
            )
            return response.data.data
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
            const response = await TransferService.updateTransferItem(
                itemId,
                data
            )
            return response.data.data
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
            await TransferService.deleteTransferItem(itemId)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['transferItems', variables.transferId],
            })
        },
    })
}
