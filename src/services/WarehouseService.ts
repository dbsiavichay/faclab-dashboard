import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export interface Warehouse {
    id: number
    name: string
    code: string
    address?: string | null
    city?: string | null
    country?: string | null
    isActive: boolean
    isDefault: boolean
    manager?: string | null
    phone?: string | null
    email?: string | null
}

export interface WarehouseInput {
    name: string
    code: string
    address?: string | null
    city?: string | null
    country?: string | null
    isActive?: boolean
    isDefault?: boolean
    manager?: string | null
    phone?: string | null
    email?: string | null
    [key: string]: unknown
}

export interface WarehouseQueryParams extends PaginationParams {
    isActive?: boolean
}

class WarehouseService {
    private host: string

    constructor() {
        this.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    async getWarehouses(params?: WarehouseQueryParams) {
        const queryParams = new URLSearchParams()
        if (params?.isActive !== undefined)
            queryParams.append('isActive', params.isActive.toString())
        if (params?.limit !== undefined)
            queryParams.append('limit', params.limit.toString())
        if (params?.offset !== undefined)
            queryParams.append('offset', params.offset.toString())
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.host}/warehouses?${queryString}`
            : `${this.host}/warehouses`
        return ApiService.fetchData<PaginatedResponse<Warehouse>>({
            url,
            method: 'get',
        })
    }

    async getWarehouseById(id: number) {
        return ApiService.fetchData<DataResponse<Warehouse>>({
            url: `${this.host}/warehouses/${id}`,
            method: 'get',
        })
    }

    async createWarehouse(data: WarehouseInput) {
        return ApiService.fetchData<DataResponse<Warehouse>>({
            url: `${this.host}/warehouses`,
            method: 'post',
            data,
        })
    }

    async updateWarehouse(id: number, data: Partial<WarehouseInput>) {
        return ApiService.fetchData<DataResponse<Warehouse>>({
            url: `${this.host}/warehouses/${id}`,
            method: 'put',
            data,
        })
    }

    async deleteWarehouse(id: number) {
        return ApiService.fetchData({
            url: `${this.host}/warehouses/${id}`,
            method: 'delete',
        })
    }
}

export default new WarehouseService()
