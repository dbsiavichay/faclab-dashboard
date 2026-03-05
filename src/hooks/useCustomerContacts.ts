import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CustomerContactService, {
    CustomerContactInput,
} from '@/services/CustomerContactService'

export function useCustomerContacts(customerId: number) {
    return useQuery({
        queryKey: ['customerContacts', customerId],
        queryFn: async () => {
            const response = await CustomerContactService.getCustomerContacts(
                customerId
            )
            return response.data.data
        },
        enabled: customerId > 0,
    })
}

export function useCustomerContact(id: number) {
    return useQuery({
        queryKey: ['customerContacts', 'detail', id],
        queryFn: async () => {
            const response = await CustomerContactService.getCustomerContact(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useCreateCustomerContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            customerId,
            contact,
        }: {
            customerId: number
            contact: CustomerContactInput
        }) => {
            const response = await CustomerContactService.createCustomerContact(
                customerId,
                contact
            )
            return response.data.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['customerContacts', variables.customerId],
            })
        },
    })
}

export function useUpdateCustomerContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            contact,
        }: {
            id: number
            contact: CustomerContactInput
        }) => {
            const response = await CustomerContactService.updateCustomerContact(
                id,
                contact
            )
            return response.data.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['customerContacts', data.customerId],
            })
            queryClient.invalidateQueries({
                queryKey: ['customerContacts', 'detail', data.id],
            })
        },
    })
}

export function useDeleteCustomerContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id }: { id: number; customerId: number }) => {
            await CustomerContactService.deleteCustomerContact(id)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['customerContacts', variables.customerId],
            })
        },
    })
}
