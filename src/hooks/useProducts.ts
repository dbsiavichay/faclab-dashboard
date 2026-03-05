import InventoryService, { ProductInput } from '@/services/InventoryService'
import {
    useMutation,
    useQuery,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import type { PaginationParams } from '@/@types/api'

export function useProducts(params?: PaginationParams) {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const response = await InventoryService.getProducts(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: ['products', id],
        queryFn: async () => {
            const response = await InventoryService.getProductById(id)
            return response.data.data
        },
        enabled: !!id,
    })
}

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (product: ProductInput) => {
            const response = await InventoryService.createProduct(product)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: Partial<ProductInput>
        }) => {
            const response = await InventoryService.updateProduct(id, data)
            return response.data.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['products', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => InventoryService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}
