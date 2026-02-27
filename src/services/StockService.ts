import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

export interface Stock {
    id: number
    productId: number
    quantity: number
    location?: string | null
}

export interface StockQueryParams {
    productId?: number
    limit?: number // default: 100, range: 1-1000
    offset?: number // default: 0
}

class StockService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getStock(params?: StockQueryParams) {
        const queryParams = new URLSearchParams()

        if (params?.productId) {
            queryParams.append('productId', params.productId.toString())
        }
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }

        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/stock?${queryString}`
            : `${this.config.host}/stock`

        return ApiService.fetchData<Stock[]>({
            url,
            method: 'get',
        })
    }
}

export default new StockService()
