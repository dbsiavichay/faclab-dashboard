import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    SerialNumberInput,
    SerialNumberListParams,
    SerialStatus,
} from '../model/types'

const KEY = ['serialNumbers'] as const

export const useSerialNumbersList = (params?: SerialNumberListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getSerialNumbers(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useSerialNumber = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getSerialNumber(id)
            return response.data
        },
        enabled: id > 0,
    })

export const useSerialNumberMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: SerialNumberInput) =>
                api.createSerialNumber(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        changeStatus: useMutation({
            mutationFn: ({
                id,
                status,
            }: {
                id: number
                status: SerialStatus
            }) => api.changeStatus(id, status).then((r) => r.data),
            onSuccess: invalidate,
        }),
    }
}
