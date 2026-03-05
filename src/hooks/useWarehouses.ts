import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import WarehouseService, {
    WarehouseInput,
    type WarehouseQueryParams,
} from '@/services/WarehouseService'

export function useWarehouses(params?: WarehouseQueryParams) {
    return useQuery({
        queryKey: ['warehouses', params],
        queryFn: async () => {
            const response = await WarehouseService.getWarehouses(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useWarehouse(id: number) {
    return useQuery({
        queryKey: ['warehouses', id],
        queryFn: async () => {
            const response = await WarehouseService.getWarehouseById(id)
            return response.data.data
        },
        enabled: !!id,
    })
}

export function useCreateWarehouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: WarehouseInput) => {
            const response = await WarehouseService.createWarehouse(data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}

export function useUpdateWarehouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: Partial<WarehouseInput>
        }) => {
            const response = await WarehouseService.updateWarehouse(id, data)
            return response.data.data
        },
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
