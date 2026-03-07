import ProductService, {
    ProductInput,
    ProductQueryParams,
} from '@/services/ProductService'
import {
    useMutation,
    useQuery,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'

export function useProducts(params?: ProductQueryParams) {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const response = await ProductService.getProducts(params)
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
            const response = await ProductService.getProductById(id)
            return response.data.data
        },
        enabled: !!id,
    })
}

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (product: ProductInput) => {
            const response = await ProductService.createProduct(product)
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
            const response = await ProductService.updateProduct(id, data)
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
        mutationFn: (id: number) => ProductService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}
