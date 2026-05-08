import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getLots,
    getLot,
    createLot,
    updateLot,
    type LotInput,
    type LotUpdateInput,
    type LotQueryParams,
} from '@/services/LotService'

export function useLots(params?: LotQueryParams) {
    return useQuery({
        queryKey: ['lots', params],
        queryFn: async () => {
            const body = await getLots(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useLot(id: number) {
    return useQuery({
        queryKey: ['lots', id],
        queryFn: async () => {
            const body = await getLot(id)
            return body.data
        },
        enabled: id > 0,
    })
}

export function useCreateLot() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (lot: LotInput) => {
            const body = await createLot(lot)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lots'] })
        },
    })
}

export function useUpdateLot() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: LotUpdateInput
        }) => {
            const body = await updateLot(id, data)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lots'] })
        },
    })
}
