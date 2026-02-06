import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MovementService, {
    MovementInput,
    MovementQueryParams,
} from '@/services/MovementService'

export function useMovements(params?: MovementQueryParams) {
    return useQuery({
        queryKey: ['movements', params],
        queryFn: async () => {
            const response = await MovementService.getMovements(params)
            return response.data
        },
    })
}

export function useCreateMovement() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (movement: MovementInput) => {
            const response = await MovementService.createMovement(movement)
            return response.data
        },
        onSuccess: () => {
            // Invalidate all movement queries to refetch
            queryClient.invalidateQueries({ queryKey: ['movements'] })
            // Also invalidate stock queries since movements affect stock
            queryClient.invalidateQueries({ queryKey: ['stock'] })
        },
    })
}
