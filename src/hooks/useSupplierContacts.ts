import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SupplierContactService, {
    SupplierContactInput,
} from '@/services/SupplierContactService'

export function useSupplierContacts(supplierId: number) {
    return useQuery({
        queryKey: ['supplierContacts', supplierId],
        queryFn: async () => {
            const response = await SupplierContactService.getSupplierContacts(
                supplierId
            )
            return response.data
        },
        enabled: supplierId > 0,
    })
}

export function useSupplierContact(id: number) {
    return useQuery({
        queryKey: ['supplierContacts', 'detail', id],
        queryFn: async () => {
            const response = await SupplierContactService.getSupplierContact(id)
            return response.data
        },
        enabled: id > 0,
    })
}

export function useCreateSupplierContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            supplierId,
            contact,
        }: {
            supplierId: number
            contact: SupplierContactInput
        }) => {
            const response = await SupplierContactService.createSupplierContact(
                supplierId,
                contact
            )
            return response.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['supplierContacts', variables.supplierId],
            })
        },
    })
}

export function useUpdateSupplierContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            contact,
        }: {
            id: number
            contact: SupplierContactInput
        }) => {
            const response = await SupplierContactService.updateSupplierContact(
                id,
                contact
            )
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['supplierContacts', data.supplierId],
            })
            queryClient.invalidateQueries({
                queryKey: ['supplierContacts', 'detail', data.id],
            })
        },
    })
}

export function useDeleteSupplierContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id }: { id: number; supplierId: number }) => {
            await SupplierContactService.deleteSupplierContact(id)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['supplierContacts', variables.supplierId],
            })
        },
    })
}
