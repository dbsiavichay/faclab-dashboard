import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

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

class UnitOfMeasureService {
    private host: string

    constructor() {
        this.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    async getUnitsOfMeasure(params?: { isActive?: boolean }) {
        return ApiService.fetchData<UnitOfMeasure[]>({
            url: `${this.host}/units-of-measure`,
            method: 'get',
            params,
        })
    }

    async getUnitOfMeasureById(id: number) {
        return ApiService.fetchData<UnitOfMeasure>({
            url: `${this.host}/units-of-measure/${id}`,
            method: 'get',
        })
    }

    async createUnitOfMeasure(data: UnitOfMeasureInput) {
        return ApiService.fetchData<UnitOfMeasure>({
            url: `${this.host}/units-of-measure`,
            method: 'post',
            data,
        })
    }

    async updateUnitOfMeasure(id: number, data: Partial<UnitOfMeasureInput>) {
        return ApiService.fetchData<UnitOfMeasure>({
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
