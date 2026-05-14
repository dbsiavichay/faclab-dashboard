import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { MovementInput, MovementListParams } from '../model/types'

const KEY = ['movements'] as const

export const useMovementsList = (params?: MovementListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const body = await api.getMovements(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })

export const useMovementMutations = () => {
    const queryClient = useQueryClient()

    return {
        create: useMutation({
            mutationFn: async (movement: MovementInput) => {
                const body = await api.createMovement(movement)
                return body.data
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: KEY })
                queryClient.invalidateQueries({ queryKey: ['stock'] })
            },
        }),
    }
}
