import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type { LotInput, LotUpdateInput, LotListParams } from '../model/types'

const KEY = ['lots'] as const

export const useLotsList = (params?: LotListParams) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: async () => {
            const response = await api.getLots(params)
            return {
                items: response.data,
                pagination: response.meta.pagination,
            }
        },
        placeholderData: keepPreviousData,
    })

export const useLot = (id: number) =>
    useQuery({
        queryKey: [...KEY, id],
        queryFn: async () => {
            const response = await api.getLot(id)
            return response.data
        },
        enabled: id > 0,
    })

export const useLotMutations = () => {
    const qc = useQueryClient()
    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

    return {
        create: useMutation({
            mutationFn: (data: LotInput) =>
                api.createLot(data).then((r) => r.data),
            onSuccess: invalidate,
        }),
        update: useMutation({
            mutationFn: ({ id, data }: { id: number; data: LotUpdateInput }) =>
                api.updateLot(id, data).then((r) => r.data),
            onSuccess: invalidate,
        }),
    }
}
