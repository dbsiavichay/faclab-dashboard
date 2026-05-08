import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    type WarehouseInput,
    type WarehouseQueryParams,
} from '@/services/WarehouseService'

export function useWarehouses(params?: WarehouseQueryParams) {
    return useQuery({
        queryKey: ['warehouses', params],
        queryFn: async () => {
            const body = await getWarehouses(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useWarehouse(id: number) {
    return useQuery({
        queryKey: ['warehouses', id],
        queryFn: async () => {
            const body = await getWarehouseById(id)
            return body.data
        },
        enabled: !!id,
    })
}

export function useCreateWarehouse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: WarehouseInput) => {
            const body = await createWarehouse(data)
            return body.data
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
            const body = await updateWarehouse(id, data)
            return body.data
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
        mutationFn: (id: number) => deleteWarehouse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}
