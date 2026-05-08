import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { SupplierListParams } from '../model/types'
import type { SupplierFormValues } from '../model/supplier.schema'

const KEY = ['suppliers'] as const

export const useSuppliersList = (params?: SupplierListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getSuppliers(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useSupplier = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getSupplier(id)
            return response.data
        },
        enabled: id > 0,
    })

export const useSupplierMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: SupplierFormValues) =>
                api.createSupplier(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({
                id,
                data,
            }: {
                id: number
                data: SupplierFormValues
            }) => api.updateSupplier(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        delete: useMutation({
            mutationFn: (id: number) => api.deleteSupplier(id),
            onSuccess: invalidate,
        }),
        activate: useMutation({
            mutationFn: (id: number) =>
                api.activateSupplier(id).then((r) => r.data),
            onSuccess: invalidate,
        }),
        deactivate: useMutation({
            mutationFn: (id: number) =>
                api.deactivateSupplier(id).then((r) => r.data),
            onSuccess: invalidate,
        }),
    }
}
