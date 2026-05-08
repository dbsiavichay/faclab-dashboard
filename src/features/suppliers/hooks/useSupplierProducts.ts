import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { SupplierProductFormValues } from '../model/supplierProduct.schema'

const KEY = ['supplierProducts'] as const

export const useSupplierProducts = (supplierId: number) =>
    useQuery({
        queryKey: [...KEY, supplierId],
        queryFn: async () => {
            const response = await api.getSupplierProducts(supplierId)
            return response.data
        },
        enabled: supplierId > 0,
    })

export const useSupplierProductsByProduct = (productId: number) =>
    useQuery({
        queryKey: [...KEY, 'byProduct', productId],
        queryFn: async () => {
            const response = await api.getSupplierProductsByProduct(productId)
            return response.data
        },
        enabled: productId > 0,
    })

export const useSupplierProductMutations = (supplierId: number) => {
    const qc = useQueryClient()
    const invalidate = () =>
        qc.invalidateQueries({ queryKey: [...KEY, supplierId] })

    return {
        create: useMutation({
            mutationFn: (data: SupplierProductFormValues) =>
                api.createSupplierProduct(supplierId, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: SupplierProductFormValues
            }) => api.updateSupplierProduct(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteSupplierProduct(id),
            onSuccess: invalidate,
        }),
    }
}
