import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import LocationService, { LocationInput } from '@/services/LocationService'

export function useLocations(params?: {
    warehouseId?: number
    isActive?: boolean
}) {
    return useQuery({
        queryKey: ['locations', params],
        queryFn: async () => {
            const response = await LocationService.getLocations(params)
            return response.data
        },
    })
}

export function useLocation(id: number) {
    return useQuery({
        queryKey: ['locations', id],
        queryFn: async () => {
            const response = await LocationService.getLocationById(id)
            return response.data
        },
        enabled: !!id,
    })
}

export function useCreateLocation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: LocationInput) =>
            LocationService.createLocation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] })
        },
    })
}

export function useUpdateLocation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number
            data: Partial<LocationInput>
        }) => LocationService.updateLocation(id, data),
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
