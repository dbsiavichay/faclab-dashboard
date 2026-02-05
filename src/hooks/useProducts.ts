import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import InventoryService, { Product } from '@/services/InventoryService'

// GET /products - Obtener todos los productos
export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await InventoryService.getProducts()
            return response.data
        },
    })
}

// GET /products/:id - Obtener un producto por ID
export function useProduct(id: number) {
    return useQuery({
        queryKey: ['products', id],
        queryFn: async () => {
            const response = await InventoryService.getProductById(id)
            return response.data
        },
        enabled: !!id,
    })
}

// POST /products - Crear un nuevo producto
export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (product: Omit<Product, 'id'>) =>
            InventoryService.createProduct(product),

        onSuccess: () => {
            // Invalida el cache para refrescar la lista
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

// PUT /products/:id - Actualizar un producto
export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Product, 'id'>> }) =>
            InventoryService.updateProduct(id, data),

        onSuccess: (_, variables) => {
            // Invalida el producto específico y la lista
            queryClient.invalidateQueries({ queryKey: ['products', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

// DELETE /products/:id - Eliminar un producto
export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => InventoryService.deleteProduct(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}
