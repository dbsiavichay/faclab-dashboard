import {
    getCustomers,
    getCustomer,
    searchCustomerByTaxId,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    activateCustomer,
    deactivateCustomer,
} from '@/services/CustomerService'
import type { CustomerInput } from '@/services/CustomerService'
import {
    useMutation,
    useQuery,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import type { PaginationParams } from '@/@types/api'

export function useCustomers(params?: PaginationParams) {
    return useQuery({
        queryKey: ['customers', params],
        queryFn: async () => {
            const body = await getCustomers(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useCustomer(id: number) {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: async () => {
            const body = await getCustomer(id)
            return body.data
        },
        enabled: id > 0,
    })
}

export function useSearchCustomerByTaxId(taxId: string) {
    return useQuery({
        queryKey: ['customers', 'search', taxId],
        queryFn: async () => {
            const body = await searchCustomerByTaxId(taxId)
            return body.data
        },
        enabled: !!taxId,
    })
}

export function useCreateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (customer: CustomerInput) => {
            const body = await createCustomer(customer)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: CustomerInput
        }) => {
            const body = await updateCustomer(id, data)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await deleteCustomer(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}

export function useActivateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await activateCustomer(id)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}

export function useDeactivateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const body = await deactivateCustomer(id)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}
