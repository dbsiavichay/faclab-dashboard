import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import LocationService, {
    LocationInput,
    type LocationQueryParams,
} from '@/services/LocationService'

export function useLocations(params?: LocationQueryParams) {
    return useQuery({
        queryKey: ['locations', params],
        queryFn: async () => {
            const response = await LocationService.getLocations(params)
            const body = response.data
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useLocation(id: number) {
    return useQuery({
        queryKey: ['locations', id],
        queryFn: async () => {
            const response = await LocationService.getLocationById(id)
            return response.data.data
        },
        enabled: !!id,
    })
}

export function useCreateLocation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: LocationInput) => {
            const response = await LocationService.createLocation(data)
            return response.data.data
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
            const response = await LocationService.updateLocation(id, data)
            return response.data.data
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
        mutationFn: (id: number) => LocationService.deleteLocation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] })
        },
    })
}
