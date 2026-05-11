export type {
    Location,
    LocationType,
    LocationInput,
    LocationListParams as LocationQueryParams,
} from '@features/locations'
export {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
} from '@features/locations/api/client'
