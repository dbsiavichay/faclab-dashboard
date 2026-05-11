import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/client'
import type { ContactFormValues } from '../model/contact.schema'

const CONTACTS_KEY = ['customerContacts'] as const

export const useCustomerContactsList = (customerId: number) =>
    useQuery({
        queryKey: [...CONTACTS_KEY, customerId],
        queryFn: async () => {
            const response = await api.getCustomerContacts(customerId)
            return response.data
        },
        enabled: customerId > 0,
    })

export const useCustomerContactMutations = (customerId: number) => {
    const qc = useQueryClient()
    const invalidate = () =>
        qc.invalidateQueries({ queryKey: [...CONTACTS_KEY, customerId] })

    return {
        create: useMutation({
            mutationFn: (data: ContactFormValues) =>
                api.createCustomerContact(customerId, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: ContactFormValues
            }) => api.updateCustomerContact(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteCustomerContact(id),
            onSuccess: invalidate,
        }),
    }
}
