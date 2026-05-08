import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getMovements,
    createMovement,
    type MovementInput,
    type MovementQueryParams,
} from '@/services/MovementService'

export function useMovements(params?: MovementQueryParams) {
    return useQuery({
        queryKey: ['movements', params],
        queryFn: async () => {
            const body = await getMovements(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useCreateMovement() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (movement: MovementInput) => {
            const body = await createMovement(movement)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movements'] })
            queryClient.invalidateQueries({ queryKey: ['stock'] })
        },
    })
}
