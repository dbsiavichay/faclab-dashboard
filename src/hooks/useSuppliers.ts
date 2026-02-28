import SupplierService, { SupplierInput } from '@/services/SupplierService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useSuppliers() {
    return useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const response = await SupplierService.getSuppliers()
            return response.data
        },
    })
}

export function useSupplier(id: number) {
    return useQuery({
        queryKey: ['suppliers', id],
        queryFn: async () => {
            const response = await SupplierService.getSupplier(id)
            return response.data
        },
        enabled: id > 0,
    })
}

export function useCreateSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (supplier: SupplierInput) => {
            const response = await SupplierService.createSupplier(supplier)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}

export function useUpdateSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: SupplierInput
        }) => {
            const response = await SupplierService.updateSupplier(id, data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await SupplierService.deleteSupplier(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}

export function useActivateSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await SupplierService.activateSupplier(id)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}

export function useDeactivateSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await SupplierService.deactivateSupplier(id)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}
