import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

// Interfaces para el servicio de categorías
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

export interface CategoryResponse {
    data: Category[]
}

export interface CategoryConfig {
    host: string
}

class CategoryService {
    private config: CategoryConfig = {
        host: ''
    }

    constructor() {
        this.config.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : (appConfig.inventoryApiHost || '')
    }

    /**
     * Configura el host para el servicio de categorías
     * @param config Configuración del servicio
     */
    setConfig(config: Partial<CategoryConfig>) {
        this.config = { ...this.config, ...config }
        return this
    }

    /**
     * Obtiene la lista completa de categorías
     */
    async getCategories() {
        return ApiService.fetchData<Category[]>({
            url: `${this.config.host}/categories`,
            method: 'get'
        })
    }

    /**
     * Obtiene una categoría por su ID
     * @param id ID de la categoría
     */
    async getCategoryById(id: number) {
        return ApiService.fetchData<Category>({
            url: `${this.config.host}/categories/${id}`,
            method: 'get'
        })
    }

    /**
     * Crea una nueva categoría
     * @param category Datos de la categoría
     */
    async createCategory(category: CategoryInput) {
        return ApiService.fetchData<Category>({
            url: `${this.config.host}/categories`,
            method: 'post',
            data: category
        })
    }

    /**
     * Actualiza una categoría existente
     * @param id ID de la categoría
     * @param category Datos de la categoría
     */
    async updateCategory(id: number, category: Partial<CategoryInput>) {
        return ApiService.fetchData<Category>({
            url: `${this.config.host}/categories/${id}`,
            method: 'put',
            data: category
        })
    }

    /**
     * Elimina una categoría
     * @param id ID de la categoría
     */
    async deleteCategory(id: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/categories/${id}`,
            method: 'delete'
        })
    }
}

export default new CategoryService()
