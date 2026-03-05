import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import CategoryService, { CategoryInput } from '@/services/CategoryService'
import type { PaginationParams } from '@/@types/api'

export function useCategories(params?: PaginationParams) {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: async () => {
            const response = await CategoryService.getCategories(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useCategory(id: number) {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: async () => {
            const response = await CategoryService.getCategoryById(id)
            return response.data.data
        },
        enabled: !!id,
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (category: CategoryInput) => {
            const response = await CategoryService.createCategory(category)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

export function useUpdateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: Partial<CategoryInput>
        }) => {
            const response = await CategoryService.updateCategory(id, data)
            return response.data.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['categories', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => CategoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}
