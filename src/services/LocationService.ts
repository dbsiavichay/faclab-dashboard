import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

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

export interface LocationQueryParams extends PaginationParams {
    warehouseId?: number
    isActive?: boolean
}

class LocationService {
    private host: string

    constructor() {
        this.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    async getLocations(params?: LocationQueryParams) {
        const queryParams = new URLSearchParams()
        if (params?.warehouseId !== undefined)
            queryParams.append('warehouseId', params.warehouseId.toString())
        if (params?.isActive !== undefined)
            queryParams.append('isActive', params.isActive.toString())
        if (params?.limit !== undefined)
            queryParams.append('limit', params.limit.toString())
        if (params?.offset !== undefined)
            queryParams.append('offset', params.offset.toString())
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.host}/locations?${queryString}`
            : `${this.host}/locations`
        return ApiService.fetchData<PaginatedResponse<Location>>({
            url,
            method: 'get',
        })
    }

    async getLocationById(id: number) {
        return ApiService.fetchData<DataResponse<Location>>({
            url: `${this.host}/locations/${id}`,
            method: 'get',
        })
    }

    async createLocation(data: LocationInput) {
        return ApiService.fetchData<DataResponse<Location>>({
            url: `${this.host}/locations`,
            method: 'post',
            data,
        })
    }

    async updateLocation(id: number, data: Partial<LocationInput>) {
        return ApiService.fetchData<DataResponse<Location>>({
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
