import SupplierService, { SupplierInput } from '@/services/SupplierService'
import {
    useMutation,
    useQuery,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import type { PaginationParams } from '@/@types/api'

export function useSuppliers(params?: PaginationParams) {
    return useQuery({
        queryKey: ['suppliers', params],
        queryFn: async () => {
            const response = await SupplierService.getSuppliers(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useSupplier(id: number) {
    return useQuery({
        queryKey: ['suppliers', id],
        queryFn: async () => {
            const response = await SupplierService.getSupplier(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useCreateSupplier() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (supplier: SupplierInput) => {
            const response = await SupplierService.createSupplier(supplier)
            return response.data.data
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
            return response.data.data
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
            return response.data.data
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
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}
