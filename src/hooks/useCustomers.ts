import CustomerService, { CustomerInput } from '@/services/CustomerService'
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
            const response = await CustomerService.getCustomers(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useCustomer(id: number) {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: async () => {
            const response = await CustomerService.getCustomer(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useSearchCustomerByTaxId(taxId: string) {
    return useQuery({
        queryKey: ['customers', 'search', taxId],
        queryFn: async () => {
            const response = await CustomerService.searchCustomerByTaxId(taxId)
            return response.data.data
        },
        enabled: !!taxId,
    })
}

export function useCreateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (customer: CustomerInput) => {
            const response = await CustomerService.createCustomer(customer)
            return response.data.data
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
            const response = await CustomerService.updateCustomer(id, data)
            return response.data.data
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
            await CustomerService.deleteCustomer(id)
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
            const response = await CustomerService.activateCustomer(id)
            return response.data.data
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
            const response = await CustomerService.deactivateCustomer(id)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}
