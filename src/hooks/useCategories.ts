import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CategoryService, { CategoryInput } from '@/services/CategoryService'

// GET /categories - Obtener todas las categorías
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await CategoryService.getCategories()
            return response.data
        },
    })
}

// GET /categories/:id - Obtener una categoría por ID
export function useCategory(id: number) {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: async () => {
            const response = await CategoryService.getCategoryById(id)
            return response.data
        },
        enabled: !!id,
    })
}

// POST /categories - Crear una nueva categoría
export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (category: CategoryInput) =>
            CategoryService.createCategory(category),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

// PUT /categories/:id - Actualizar una categoría
export function useUpdateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CategoryInput> }) =>
            CategoryService.updateCategory(id, data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['categories', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

// DELETE /categories/:id - Eliminar una categoría
export function useDeleteCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => CategoryService.deleteCategory(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}
