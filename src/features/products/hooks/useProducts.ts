import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { ProductInput, ProductListParams } from '../model/types'

const KEY = ['products'] as const

export const useProductsList = (params?: ProductListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getProducts(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useProduct = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getProductById(id)
            return response.data
        },
        enabled: !!id,
    })

export const useProductMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: ProductInput) =>
                api.createProduct(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: Partial<ProductInput>
            }) => api.updateProduct(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteProduct(id),
            onSuccess: invalidate,
        }),
    }
}
