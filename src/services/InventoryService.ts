import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export interface Product {
    id: number
    name: string
    sku: string
    description?: string | null
    categoryId?: number | null
    unitOfMeasureId?: number | null
}

export interface ProductInput {
    name: string
    sku: string
    description?: string
    categoryId?: number
    unitOfMeasureId?: number
    [key: string]: unknown
}

export interface InventoryConfig {
    host: string
}

class InventoryService {
    private config: InventoryConfig = {
        host: '',
    }

    constructor() {
        this.config.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    setConfig(config: Partial<InventoryConfig>) {
        this.config = { ...this.config, ...config }
        return this
    }

    async getProducts(params?: PaginationParams) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined)
            queryParams.append('limit', params.limit.toString())
        if (params?.offset !== undefined)
            queryParams.append('offset', params.offset.toString())
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/products?${queryString}`
            : `${this.config.host}/products`
        return ApiService.fetchData<PaginatedResponse<Product>>({
            url,
            method: 'get',
        })
    }

    async getProductById(id: number) {
        return ApiService.fetchData<DataResponse<Product>>({
            url: `${this.config.host}/products/${id}`,
            method: 'get',
        })
    }

    async createProduct(product: ProductInput) {
        return ApiService.fetchData<DataResponse<Product>>({
            url: `${this.config.host}/products`,
            method: 'post',
            data: product,
        })
    }

    async updateProduct(id: number, product: Partial<ProductInput>) {
        return ApiService.fetchData<DataResponse<Product>>({
            url: `${this.config.host}/products/${id}`,
            method: 'put',
            data: product,
        })
    }

    async deleteProduct(id: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/products/${id}`,
            method: 'delete',
        })
    }
}

export default new InventoryService()
