import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import LotService, {
    type LotInput,
    type LotUpdateInput,
    type LotQueryParams,
} from '@/services/LotService'

export function useLots(params?: LotQueryParams) {
    return useQuery({
        queryKey: ['lots', params],
        queryFn: async () => {
            const response = await LotService.getLots(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useLot(id: number) {
    return useQuery({
        queryKey: ['lots', id],
        queryFn: async () => {
            const response = await LotService.getLot(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useCreateLot() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (lot: LotInput) => {
            const response = await LotService.createLot(lot)
            return response.data.data
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
            const response = await LotService.updateLot(id, data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lots'] })
        },
    })
}
