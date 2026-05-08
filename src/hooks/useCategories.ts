import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '@/services/CategoryService'
import type { CategoryInput } from '@/services/CategoryService'
import type { PaginationParams } from '@/@types/api'

export function useCategories(params?: PaginationParams) {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: async () => {
            const body = await getCategories(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useCategory(id: number) {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: async () => {
            const body = await getCategoryById(id)
            return body.data
        },
        enabled: !!id,
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (category: CategoryInput) => {
            const body = await createCategory(category)
            return body.data
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
            const body = await updateCategory(id, data)
            return body.data
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
        mutationFn: (id: number) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}
