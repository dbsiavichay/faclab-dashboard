import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import WarehouseService, { WarehouseInput } from '@/services/WarehouseService'

export function useWarehouses(params?: { isActive?: boolean }) {
    return useQuery({
        queryKey: ['warehouses', params],
        queryFn: async () => {
            const response = await WarehouseService.getWarehouses(params)
            return response.data
        },
    })
}

export function useWarehouse(id: number) {
    return useQuery({
        queryKey: ['warehouses', id],
        queryFn: async () => {
            const response = await WarehouseService.getWarehouseById(id)
            return response.data
        },
        enabled: !!id,
    })
}

export function useCreateWarehouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: WarehouseInput) =>
            WarehouseService.createWarehouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}

export function useUpdateWarehouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: Partial<WarehouseInput>
        }) => WarehouseService.updateWarehouse(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['warehouses', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}

export function useDeleteWarehouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => WarehouseService.deleteWarehouse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}
