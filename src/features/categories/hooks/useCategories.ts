import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { PaginationParams } from '@/@types/api'
import type { CategoryFormValues } from '../model/category.schema'

const KEY = ['categories'] as const

export const useCategoriesList = (params?: PaginationParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getCategories(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useCategory = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getCategoryById(id)
            return response.data
        },
        enabled: id > 0,
    })

export const useCategoryMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: CategoryFormValues) =>
                api.createCategory(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: Partial<CategoryFormValues>
            }) => api.updateCategory(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteCategory(id),
            onSuccess: invalidate,
        }),
    }
}
