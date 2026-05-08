import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getSerialNumbers,
    getSerialNumber,
    createSerialNumber,
    changeStatus,
    type SerialNumberInput,
    type SerialNumberQueryParams,
    type SerialStatus,
} from '@/services/SerialNumberService'

export function useSerialNumbers(params?: SerialNumberQueryParams) {
    return useQuery({
        queryKey: ['serialNumbers', params],
        queryFn: async () => {
            const body = await getSerialNumbers(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useSerialNumber(id: number) {
    return useQuery({
        queryKey: ['serialNumbers', id],
        queryFn: async () => {
            const body = await getSerialNumber(id)
            return body.data
        },
        enabled: id > 0,
    })
}

export function useCreateSerialNumber() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (serialNumber: SerialNumberInput) => {
            const body = await createSerialNumber(serialNumber)
            return body.data
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
            const body = await changeStatus(id, status)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serialNumbers'] })
        },
    })
}
