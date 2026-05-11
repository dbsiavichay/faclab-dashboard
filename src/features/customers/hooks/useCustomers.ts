import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { CustomerListParams } from '../model/types'
import type { CustomerFormValues } from '../model/customer.schema'

const KEY = ['customers'] as const

export const useCustomersList = (params?: CustomerListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getCustomers(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useCustomer = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getCustomer(id)
            return response.data
        },
        enabled: id > 0,
    })

export const useSearchCustomerByTaxId = (taxId: string) =>
    useQuery({
        queryKey: [...KEY, 'search', taxId],
        queryFn: async () => {
            const response = await api.searchCustomerByTaxId(taxId)
            return response.data
        },
        enabled: !!taxId,
    })

export const useCustomerMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: CustomerFormValues) =>
                api.createCustomer(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: CustomerFormValues
            }) => api.updateCustomer(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteCustomer(id),
            onSuccess: invalidate,
        }),
        activate: useMutation({
            mutationFn: (id: number) =>
                api.activateCustomer(id).then((r) => r.data),
            onSuccess: invalidate,
        }),
        deactivate: useMutation({
            mutationFn: (id: number) =>
                api.deactivateCustomer(id).then((r) => r.data),
            onSuccess: invalidate,
        }),
    }
}
