import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    type LocationInput,
    type LocationQueryParams,
} from '@/services/LocationService'

export function useLocations(params?: LocationQueryParams) {
    return useQuery({
        queryKey: ['locations', params],
        queryFn: async () => {
            const body = await getLocations(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useLocation(id: number) {
    return useQuery({
        queryKey: ['locations', id],
        queryFn: async () => {
            const body = await getLocationById(id)
            return body.data
        },
        enabled: !!id,
    })
}

export function useCreateLocation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: LocationInput) => {
            const body = await createLocation(data)
            return body.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] })
        },
    })
}

export function useUpdateLocation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number
            data: Partial<LocationInput>
        }) => {
            const body = await updateLocation(id, data)
            return body.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['locations', variables.id],
            })
            queryClient.invalidateQueries({ queryKey: ['locations'] })
        },
    })
}

export function useDeleteLocation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteLocation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] })
        },
    })
}
