import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    UnitOfMeasureInput,
    UnitOfMeasureListParams,
} from '../model/types'

const KEY = ['units-of-measure'] as const

export const useUnitsOfMeasureList = (params?: UnitOfMeasureListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getUnitsOfMeasure(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useUnitOfMeasure = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getUnitOfMeasureById(id)
            return response.data
        },
        enabled: !!id,
    })

export const useUnitOfMeasureMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: UnitOfMeasureInput) =>
                api.createUnitOfMeasure(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: Partial<UnitOfMeasureInput>
            }) => api.updateUnitOfMeasure(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteUnitOfMeasure(id),
            onSuccess: invalidate,
        }),
    }
}
