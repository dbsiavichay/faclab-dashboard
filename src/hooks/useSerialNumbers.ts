import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import SerialNumberService, {
    type SerialNumberInput,
    type SerialNumberQueryParams,
    type SerialStatus,
} from '@/services/SerialNumberService'

export function useSerialNumbers(params?: SerialNumberQueryParams) {
    return useQuery({
        queryKey: ['serialNumbers', params],
        queryFn: async () => {
            const response = await SerialNumberService.getSerialNumbers(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useSerialNumber(id: number) {
    return useQuery({
        queryKey: ['serialNumbers', id],
        queryFn: async () => {
            const response = await SerialNumberService.getSerialNumber(id)
            return response.data.data
        },
        enabled: id > 0,
    })
}

export function useCreateSerialNumber() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (serialNumber: SerialNumberInput) => {
            const response = await SerialNumberService.createSerialNumber(
                serialNumber
            )
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serialNumbers'] })
        },
    })
}

export function useChangeSerialNumberStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            status,
        }: {
            id: number
            status: SerialStatus
        }) => {
            const response = await SerialNumberService.changeStatus(id, status)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serialNumbers'] })
        },
    })
}
