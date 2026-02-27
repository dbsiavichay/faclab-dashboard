import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

export type LocationType = 'STORAGE' | 'RECEIVING' | 'SHIPPING' | 'RETURN'

export interface Location {
    id: number
    warehouseId: number
    name: string
    code: string
    type: LocationType
    isActive: boolean
    capacity?: number | null
}

export interface LocationInput {
    warehouseId: number
    name: string
    code: string
    type: LocationType
    isActive?: boolean
    capacity?: number | null
    [key: string]: unknown
}

class LocationService {
    private host: string

    constructor() {
        this.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    async getLocations(params?: { warehouseId?: number; isActive?: boolean }) {
        return ApiService.fetchData<Location[]>({
            url: `${this.host}/locations`,
            method: 'get',
            params,
        })
    }

    async getLocationById(id: number) {
        return ApiService.fetchData<Location>({
            url: `${this.host}/locations/${id}`,
            method: 'get',
        })
    }

    async createLocation(data: LocationInput) {
        return ApiService.fetchData<Location>({
            url: `${this.host}/locations`,
            method: 'post',
            data,
        })
    }

    async updateLocation(id: number, data: Partial<LocationInput>) {
        return ApiService.fetchData<Location>({
            url: `${this.host}/locations/${id}`,
            method: 'put',
            data,
        })
    }

    async deleteLocation(id: number) {
        return ApiService.fetchData({
            url: `${this.host}/locations/${id}`,
            method: 'delete',
        })
    }
}

export default new LocationService()
