import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { PayableParams, SupplierPaymentInput } from '../model/types'

export const PAYABLES_KEY = ['payables'] as const
export const SUPPLIER_ACCOUNTS_KEY = ['supplierAccounts'] as const

/** What a payment changes: the payables and the supplier's account */
export const invalidateAfterSupplierPayment = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: PAYABLES_KEY })
    queryClient.invalidateQueries({ queryKey: SUPPLIER_ACCOUNTS_KEY })
}

export const usePayables = (params?: PayableParams) =>
    useQuery({
        queryKey: [...PAYABLES_KEY, params],
        queryFn: async () => {
            const body = await api.getPayables(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })

export const usePayable = (id: number) =>
    useQuery({
        queryKey: [...PAYABLES_KEY, id],
        queryFn: async () => (await api.getPayable(id)).data,
        enabled: id > 0,
    })

export const useSupplierAccount = (supplierId: number) =>
    useQuery({
        queryKey: [...SUPPLIER_ACCOUNTS_KEY, supplierId],
        queryFn: async () => (await api.getSupplierAccount(supplierId)).data,
        enabled: supplierId > 0,
    })

export const useCreateSupplierPayment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: SupplierPaymentInput) =>
            (await api.createSupplierPayment(data)).data,
        onSuccess: () => invalidateAfterSupplierPayment(queryClient),
    })
}
