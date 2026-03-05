import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import UnitOfMeasureService, {
    UnitOfMeasureInput,
    type UnitOfMeasureQueryParams,
} from '@/services/UnitOfMeasureService'

export function useUnitsOfMeasure(params?: UnitOfMeasureQueryParams) {
    return useQuery({
        queryKey: ['units-of-measure', params],
        queryFn: async () => {
            const response = await UnitOfMeasureService.getUnitsOfMeasure(
                params
            )
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useUnitOfMeasure(id: number) {
    return useQuery({
        queryKey: ['units-of-measure', id],
        queryFn: async () => {
            const response = await UnitOfMeasureService.getUnitOfMeasureById(id)
            return response.data.data
        },
        enabled: !!id,
    })
}

export function useCreateUnitOfMeasure() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UnitOfMeasureInput) => {
            const response = await UnitOfMeasureService.createUnitOfMeasure(
                data
            )
            return response.data.data
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
            const response = await UnitOfMeasureService.updateUnitOfMeasure(
                id,
                data
            )
            return response.data.data
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
        mutationFn: (id: number) =>
            UnitOfMeasureService.deleteUnitOfMeasure(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })
        },
    })
}
