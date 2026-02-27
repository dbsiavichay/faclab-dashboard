import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import UnitOfMeasureService, { UnitOfMeasureInput } from '@/services/UnitOfMeasureService'

export function useUnitsOfMeasure(params?: { isActive?: boolean }) {
    return useQuery({
        queryKey: ['units-of-measure', params],
        queryFn: async () => {
            const response = await UnitOfMeasureService.getUnitsOfMeasure(params)
            return response.data
        },
    })
}

export function useUnitOfMeasure(id: number) {
    return useQuery({
        queryKey: ['units-of-measure', id],
        queryFn: async () => {
            const response = await UnitOfMeasureService.getUnitOfMeasureById(id)
            return response.data
        },
        enabled: !!id,
    })
}

export function useCreateUnitOfMeasure() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UnitOfMeasureInput) =>
            UnitOfMeasureService.createUnitOfMeasure(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })
        },
    })
}

export function useUpdateUnitOfMeasure() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<UnitOfMeasureInput> }) =>
            UnitOfMeasureService.updateUnitOfMeasure(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['units-of-measure', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })
        },
    })
}

export function useDeleteUnitOfMeasure() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => UnitOfMeasureService.deleteUnitOfMeasure(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })
        },
    })
}
