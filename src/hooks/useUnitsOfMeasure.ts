import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getUnitsOfMeasure,
    getUnitOfMeasureById,
    createUnitOfMeasure,
    updateUnitOfMeasure,
    deleteUnitOfMeasure,
    type UnitOfMeasureInput,
    type UnitOfMeasureQueryParams,
} from '@/services/UnitOfMeasureService'

export function useUnitsOfMeasure(params?: UnitOfMeasureQueryParams) {
    return useQuery({
        queryKey: ['units-of-measure', params],
        queryFn: async () => {
            const body = await getUnitsOfMeasure(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useUnitOfMeasure(id: number) {
    return useQuery({
        queryKey: ['units-of-measure', id],
        queryFn: async () => {
            const body = await getUnitOfMeasureById(id)
            return body.data
        },
        enabled: !!id,
    })
}

export function useCreateUnitOfMeasure() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UnitOfMeasureInput) => {
            const body = await createUnitOfMeasure(data)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })
        },
    })
}

export function useUpdateUnitOfMeasure() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: Partial<UnitOfMeasureInput>
        }) => {
            const body = await updateUnitOfMeasure(id, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['units-of-measure', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })
        },
    })
}

export function useDeleteUnitOfMeasure() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteUnitOfMeasure(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })
        },
    })
}
