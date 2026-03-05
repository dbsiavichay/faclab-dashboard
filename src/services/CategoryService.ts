import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

export interface Category {
    id: number
    name: string
    description?: string | null
}

export interface CategoryInput {
    name: string
    description?: string
    [key: string]: unknown
}

export interface CategoryConfig {
    host: string
}

class CategoryService {
    private config: CategoryConfig = {
        host: '',
    }

    constructor() {
        this.config.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    setConfig(config: Partial<CategoryConfig>) {
        this.config = { ...this.config, ...config }
        return this
    }

    async getCategories(params?: PaginationParams) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined)
            queryParams.append('limit', params.limit.toString())
        if (params?.offset !== undefined)
            queryParams.append('offset', params.offset.toString())
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/categories?${queryString}`
            : `${this.config.host}/categories`
        return ApiService.fetchData<PaginatedResponse<Category>>({
            url,
            method: 'get',
        })
    }

    async getCategoryById(id: number) {
        return ApiService.fetchData<DataResponse<Category>>({
            url: `${this.config.host}/categories/${id}`,
            method: 'get',
        })
    }

    async createCategory(category: CategoryInput) {
        return ApiService.fetchData<DataResponse<Category>>({
            url: `${this.config.host}/categories`,
            method: 'post',
            data: category,
        })
    }

    async updateCategory(id: number, category: Partial<CategoryInput>) {
        return ApiService.fetchData<DataResponse<Category>>({
            url: `${this.config.host}/categories/${id}`,
            method: 'put',
            data: category,
        })
    }

    async deleteCategory(id: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/categories/${id}`,
            method: 'delete',
        })
    }
}

export default new CategoryService()
