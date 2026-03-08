import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import AdjustmentService, {
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
            const response = await AdjustmentService.getAdjustments(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useAdjustment(id: number) {
    return useQuery({
        queryKey: ['adjustments', id],
        queryFn: async () => {
            const response = await AdjustmentService.getAdjustment(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useCreateAdjustment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: AdjustmentInput) => {
            const response = await AdjustmentService.createAdjustment(data)
            return response.data.data
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
            const response = await AdjustmentService.updateAdjustment(id, data)
            return response.data.data
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
        mutationFn: (id: number) => AdjustmentService.deleteAdjustment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adjustments'] })
        },
    })
}

export function useConfirmAdjustment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await AdjustmentService.confirmAdjustment(id)
            return response.data.data
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
            const response = await AdjustmentService.cancelAdjustment(id)
            return response.data.data
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
            const response = await AdjustmentService.getAdjustmentItems(
                adjustmentId
            )
            return response.data.data
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
            const response = await AdjustmentService.addAdjustmentItem(
                adjustmentId,
                data
            )
            return response.data.data
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
            const response = await AdjustmentService.updateAdjustmentItem(
                itemId,
                data
            )
            return response.data.data
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
            await AdjustmentService.deleteAdjustmentItem(itemId)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['adjustmentItems', variables.adjustmentId],
            })
        },
    })
}
