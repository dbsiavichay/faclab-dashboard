import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { ContactFormValues } from '@features/customers'

const KEY = ['supplierContacts'] as const

export const useSupplierContacts = (supplierId: number) =>
    useQuery({
        queryKey: [...KEY, supplierId],
        queryFn: async () => {
            const response = await api.getSupplierContacts(supplierId)
            return response.data
        },
        enabled: supplierId > 0,
    })

export const useSupplierContactMutations = (supplierId: number) => {
    const qc = useQueryClient()
    const invalidate = () =>
        qc.invalidateQueries({ queryKey: [...KEY, supplierId] })

    return {
        create: useMutation({
            mutationFn: (data: ContactFormValues) =>
                api.createSupplierContact(supplierId, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: ContactFormValues
            }) => api.updateSupplierContact(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteSupplierContact(id),
            onSuccess: invalidate,
        }),
    }
}
