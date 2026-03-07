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
    description: string | null
    barcode: string | null
    categoryId: number | null
    unitOfMeasureId: number | null
    purchasePrice: number | null
    salePrice: number | null
    isActive: boolean
    isService: boolean
    minStock: number
    maxStock: number | null
    reorderPoint: number
    leadTimeDays: number | null
}

export interface ProductInput {
    name: string
    sku: string
    description?: string | null
    barcode?: string | null
    categoryId?: number | null
    unitOfMeasureId?: number | null
    purchasePrice?: number | null
    salePrice?: number | null
    isActive?: boolean
    isService?: boolean
    minStock?: number
    maxStock?: number | null
    reorderPoint?: number
    leadTimeDays?: number | null
}

export interface ProductQueryParams extends PaginationParams {
    categoryId?: number
}

export interface ProductServiceConfig {
    host: string
}

class ProductService {
    private config: ProductServiceConfig = {
        host: '',
    }

    constructor() {
        this.config.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    setConfig(config: Partial<ProductServiceConfig>) {
        this.config = { ...this.config, ...config }
        return this
    }

    async getProducts(params?: ProductQueryParams) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined)
            queryParams.append('limit', params.limit.toString())
        if (params?.offset !== undefined)
            queryParams.append('offset', params.offset.toString())
        if (params?.categoryId !== undefined)
            queryParams.append('categoryId', params.categoryId.toString())
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
        return ApiService.fetchData<DataResponse<Product>, ProductInput>({
            url: `${this.config.host}/products`,
            method: 'post',
            data: product,
        })
    }

    async updateProduct(id: number, product: Partial<ProductInput>) {
        return ApiService.fetchData<
            DataResponse<Product>,
            Partial<ProductInput>
        >({
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

export default new ProductService()
