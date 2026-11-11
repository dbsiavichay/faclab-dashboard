import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    CustomerPaymentInput,
    ReceivableParams,
    StatementParams,
} from '../model/types'

export const RECEIVABLES_KEY = ['receivables'] as const
export const CUSTOMER_ACCOUNTS_KEY = ['customerAccounts'] as const

export function useReceivables(params?: ReceivableParams) {
    return useQuery({
        queryKey: [...RECEIVABLES_KEY, 'list', params],
        queryFn: async () => {
            const body = await api.getReceivables(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useReceivable(id: number) {
    return useQuery({
        queryKey: [...RECEIVABLES_KEY, id],
        queryFn: async () => (await api.getReceivable(id)).data,
        enabled: id > 0,
    })
}

export function useReceivablesAging(branchId?: number) {
    return useQuery({
        queryKey: [...RECEIVABLES_KEY, 'aging', branchId ?? null],
        queryFn: async () => (await api.getAging(branchId)).data,
    })
}

export function useCustomerAccount(customerId: number) {
    return useQuery({
        queryKey: [...CUSTOMER_ACCOUNTS_KEY, customerId],
        queryFn: async () => (await api.getCustomerAccount(customerId)).data,
        enabled: customerId > 0,
    })
}

export function useCustomerStatement(
    customerId: number,
    params?: StatementParams
) {
    return useQuery({
        queryKey: [...CUSTOMER_ACCOUNTS_KEY, customerId, 'statement', params],
        queryFn: async () => (await api.getStatement(customerId, params)).data,
        enabled: customerId > 0,
        placeholderData: keepPreviousData,
    })
}

export function useCustomerPayments(customerId: number) {
    return useQuery({
        queryKey: [...CUSTOMER_ACCOUNTS_KEY, customerId, 'payments'],
        queryFn: async () => {
            const body = await api.getCustomerPayments({
                customerId,
                limit: 50,
            })
            return { items: body.data, pagination: body.meta.pagination }
        },
        enabled: customerId > 0,
    })
}

/**
 * Después de un abono cambian la cartera, la cuenta del cliente y el estado de
 * pago de sus ventas
 */
export function invalidateAfterPayment(
    queryClient: ReturnType<typeof useQueryClient>
) {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: RECEIVABLES_KEY }),
        queryClient.invalidateQueries({ queryKey: CUSTOMER_ACCOUNTS_KEY }),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
    ])
}

/** Un abono fuera de la caja */
export function useCreateCustomerPayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: CustomerPaymentInput) =>
            (await api.createCustomerPayment(data)).data,
        onSuccess: () => invalidateAfterPayment(queryClient),
    })
}
