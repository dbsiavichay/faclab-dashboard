import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import MovementService, {
    MovementInput,
    MovementQueryParams,
} from '@/services/MovementService'

export function useMovements(params?: MovementQueryParams) {
    return useQuery({
        queryKey: ['movements', params],
        queryFn: async () => {
            const response = await MovementService.getMovements(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useCreateMovement() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (movement: MovementInput) => {
            const response = await MovementService.createMovement(movement)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movements'] })
            queryClient.invalidateQueries({ queryKey: ['stock'] })
        },
    })
}
