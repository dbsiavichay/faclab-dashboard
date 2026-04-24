import ApiService from '@/services/ApiService'
import appConfig from '@/configs/app.config'
import type { DataResponse } from '@/@types/api'
import type { POSProduct, ListResponse } from './POSTypes'

class POSProductService {
    private host = appConfig.posApiHost || 'http://localhost:3000/api/pos'

    async getProducts() {
        return ApiService.fetchData<ListResponse<POSProduct>>({
            url: `${this.host}/products`,
            method: 'get',
        })
    }

    async searchProducts(term: string, limit?: number) {
        const queryParams = new URLSearchParams({ term })
        if (limit !== undefined) {
            queryParams.append('limit', limit.toString())
        }
        return ApiService.fetchData<ListResponse<POSProduct>>({
            url: `${this.host}/products/search?${queryParams.toString()}`,
            method: 'get',
        })
    }

    async getProduct(id: number) {
        return ApiService.fetchData<DataResponse<POSProduct>>({
            url: `${this.host}/products/${id}`,
            method: 'get',
        })
    }
}

export default new POSProductService()
