import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getAdjustments,
    getAdjustment,
    createAdjustment,
    updateAdjustment,
    deleteAdjustment,
    confirmAdjustment,
    cancelAdjustment,
    getAdjustmentItems,
    addAdjustmentItem,
    updateAdjustmentItem,
    deleteAdjustmentItem,
    type AdjustmentInput,
    type AdjustmentUpdateInput,
    type AdjustmentQueryParams,
    type AdjustmentItemInput,
    type AdjustmentItemUpdateInput,
} from '@/services/AdjustmentService'

// --- Adjustments ---

export function useAdjustments(params?: AdjustmentQueryParams) {
    return useQuery({
        queryKey: ['adjustments', params],
        queryFn: async () => {
            const body = await getAdjustments(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useAdjustment(id: number) {
    return useQuery({
        queryKey: ['adjustments', id],
        queryFn: async () => {
            const body = await getAdjustment(id)
            return body.data
        },
        enabled: id > 0,
    })
}

export function useCreateAdjustment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: AdjustmentInput) => {
            const body = await createAdjustment(data)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adjustments'] })
        },
    })
}

export function useUpdateAdjustment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: AdjustmentUpdateInput
        }) => {
            const body = await updateAdjustment(id, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['adjustments', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['adjustments'] })
        },
    })
}

export function useDeleteAdjustment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteAdjustment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adjustments'] })
        },
    })
}

export function useConfirmAdjustment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await confirmAdjustment(id)
            return body.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: ['adjustments', id],
            })
            queryClient.invalidateQueries({ queryKey: ['adjustments'] })
        },
    })
}

export function useCancelAdjustment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await cancelAdjustment(id)
            return body.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: ['adjustments', id],
            })
            queryClient.invalidateQueries({ queryKey: ['adjustments'] })
        },
    })
}

// --- Adjustment Items ---

export function useAdjustmentItems(adjustmentId: number) {
    return useQuery({
        queryKey: ['adjustmentItems', adjustmentId],
        queryFn: async () => {
            const body = await getAdjustmentItems(adjustmentId)
            return body.data
        },
        enabled: adjustmentId > 0,
    })
}

export function useAddAdjustmentItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            adjustmentId,
            data,
        }: {
            adjustmentId: number
            data: AdjustmentItemInput
        }) => {
            const body = await addAdjustmentItem(adjustmentId, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['adjustmentItems', variables.adjustmentId],
            })
        },
    })
}

export function useUpdateAdjustmentItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            itemId,
            data,
        }: {
            itemId: number
            adjustmentId: number
            data: AdjustmentItemUpdateInput
        }) => {
            const body = await updateAdjustmentItem(itemId, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['adjustmentItems', variables.adjustmentId],
            })
        },
    })
}

export function useDeleteAdjustmentItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            itemId,
        }: {
            itemId: number
            adjustmentId: number
        }) => {
            await deleteAdjustmentItem(itemId)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['adjustmentItems', variables.adjustmentId],
            })
        },
    })
}
