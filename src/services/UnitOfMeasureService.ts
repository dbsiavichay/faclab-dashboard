import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export interface UnitOfMeasure {
    id: number
    name: string
    symbol: string
    description?: string | null
    isActive: boolean
}

export interface UnitOfMeasureInput {
    name: string
    symbol: string
    description?: string | null
    isActive?: boolean
    [key: string]: unknown
}

export interface UnitOfMeasureQueryParams extends PaginationParams {
    isActive?: boolean
}

class UnitOfMeasureService {
    private host: string

    constructor() {
        this.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    async getUnitsOfMeasure(params?: UnitOfMeasureQueryParams) {
        const queryParams = new URLSearchParams()
        if (params?.isActive !== undefined)
            queryParams.append('isActive', params.isActive.toString())
        if (params?.limit !== undefined)
            queryParams.append('limit', params.limit.toString())
        if (params?.offset !== undefined)
            queryParams.append('offset', params.offset.toString())
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.host}/units-of-measure?${queryString}`
            : `${this.host}/units-of-measure`
        return ApiService.fetchData<PaginatedResponse<UnitOfMeasure>>({
            url,
            method: 'get',
        })
    }

    async getUnitOfMeasureById(id: number) {
        return ApiService.fetchData<DataResponse<UnitOfMeasure>>({
            url: `${this.host}/units-of-measure/${id}`,
            method: 'get',
        })
    }

    async createUnitOfMeasure(data: UnitOfMeasureInput) {
        return ApiService.fetchData<DataResponse<UnitOfMeasure>>({
            url: `${this.host}/units-of-measure`,
            method: 'post',
            data,
        })
    }

    async updateUnitOfMeasure(id: number, data: Partial<UnitOfMeasureInput>) {
        return ApiService.fetchData<DataResponse<UnitOfMeasure>>({
            url: `${this.host}/units-of-measure/${id}`,
            method: 'put',
            data,
        })
    }

    async deleteUnitOfMeasure(id: number) {
        return ApiService.fetchData({
            url: `${this.host}/units-of-measure/${id}`,
            method: 'delete',
        })
    }
}

export default new UnitOfMeasureService()
