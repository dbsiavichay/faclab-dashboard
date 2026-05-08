import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '@/services/ProductService'
import type {
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
            const body = await getProducts(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: ['products', id],
        queryFn: async () => {
            const body = await getProductById(id)
            return body.data
        },
        enabled: !!id,
    })
}

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (product: ProductInput) => {
            const body = await createProduct(product)
            return body.data
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
            const body = await updateProduct(id, data)
            return body.data
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
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}
