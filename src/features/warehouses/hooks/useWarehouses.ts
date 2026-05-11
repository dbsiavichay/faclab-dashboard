import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { WarehouseListParams } from '../model/types'
import type { WarehouseFormValues } from '../model/warehouse.schema'

const KEY = ['warehouses'] as const

export const useWarehousesList = (params?: WarehouseListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getWarehouses(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useWarehouse = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getWarehouseById(id)
            return response.data
        },
        enabled: id > 0,
    })

export const useWarehouseMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: WarehouseFormValues) =>
                api.createWarehouse(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: Partial<WarehouseFormValues>
            }) => api.updateWarehouse(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteWarehouse(id),
            onSuccess: invalidate,
        }),
    }
}
