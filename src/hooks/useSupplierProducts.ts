import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SupplierProductService, {
    SupplierProductInput,
} from '@/services/SupplierProductService'

export function useSupplierProducts(supplierId: number) {
    return useQuery({
        queryKey: ['supplierProducts', supplierId],
        queryFn: async () => {
            const response = await SupplierProductService.getSupplierProducts(
                supplierId
            )
            return response.data
        },
        enabled: supplierId > 0,
    })
}

export function useSupplierProductsByProduct(productId: number) {
    return useQuery({
        queryKey: ['supplierProducts', 'byProduct', productId],
        queryFn: async () => {
            const response =
                await SupplierProductService.getSupplierProductsByProduct(
                    productId
                )
            return response.data
        },
        enabled: productId > 0,
    })
}

export function useCreateSupplierProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            supplierId,
            product,
        }: {
            supplierId: number
            product: SupplierProductInput
        }) => {
            const response = await SupplierProductService.createSupplierProduct(
                supplierId,
                product
            )
            return response.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['supplierProducts', variables.supplierId],
            })
        },
    })
}

export function useUpdateSupplierProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            product,
        }: {
            id: number
            product: SupplierProductInput
        }) => {
            const response = await SupplierProductService.updateSupplierProduct(
                id,
                product
            )
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['supplierProducts', data.supplierId],
            })
        },
    })
}

export function useDeleteSupplierProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id }: { id: number; supplierId: number }) => {
            await SupplierProductService.deleteSupplierProduct(id)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['supplierProducts', variables.supplierId],
            })
        },
    })
}
