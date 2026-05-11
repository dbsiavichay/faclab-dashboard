export type { Location, LocationType, LocationListParams } from './model/types'
export type { LocationInput } from './api/client'

export {
    locationSchema,
    type LocationFormValues,
} from './model/location.schema'

export {
    useLocationsList,
    useLocation,
    useLocationMutations,
} from './hooks/useLocations'

export { locationsRoutes } from './routes'
