import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getCustomerContacts,
    getCustomerContact,
    createCustomerContact,
    updateCustomerContact,
    deleteCustomerContact,
} from '@/services/CustomerContactService'
import type { CustomerContactInput } from '@/services/CustomerContactService'

export function useCustomerContacts(customerId: number) {
    return useQuery({
        queryKey: ['customerContacts', customerId],
        queryFn: async () => {
            const body = await getCustomerContacts(customerId)
            return body.data
        },
        enabled: customerId > 0,
    })
}

export function useCustomerContact(id: number) {
    return useQuery({
        queryKey: ['customerContacts', 'detail', id],
        queryFn: async () => {
            const body = await getCustomerContact(id)
            return body.data
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
            const body = await createCustomerContact(customerId, contact)
            return body.data
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
            const body = await updateCustomerContact(id, contact)
            return body.data
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
            await deleteCustomerContact(id)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['customerContacts', variables.customerId],
            })
        },
    })
}
