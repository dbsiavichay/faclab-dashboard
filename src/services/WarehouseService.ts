import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

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

class WarehouseService {
    private host: string

    constructor() {
        this.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    async getWarehouses(params?: { isActive?: boolean }) {
        return ApiService.fetchData<Warehouse[]>({
            url: `${this.host}/warehouses`,
            method: 'get',
            params,
        })
    }

    async getWarehouseById(id: number) {
        return ApiService.fetchData<Warehouse>({
            url: `${this.host}/warehouses/${id}`,
            method: 'get',
        })
    }

    async createWarehouse(data: WarehouseInput) {
        return ApiService.fetchData<Warehouse>({
            url: `${this.host}/warehouses`,
            method: 'post',
            data,
        })
    }

    async updateWarehouse(id: number, data: Partial<WarehouseInput>) {
        return ApiService.fetchData<Warehouse>({
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
