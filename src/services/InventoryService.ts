import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

// Interfaces para el servicio de inventario
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

export interface ProductResponse {
    data: Product[]
}

export interface InventoryConfig {
    host: string
}

class InventoryService {
    private config: InventoryConfig = {
        host: '',
    }

    constructor() {
        // Usa el host específico para inventario si está definido, o el apiPrefix general
        this.config.host = appConfig.enableMock
            ? appConfig.apiPrefix
            : appConfig.inventoryApiHost || ''
    }

    /**
     * Configura el host para el servicio de inventario
     * @param config Configuración del servicio
     */
    setConfig(config: Partial<InventoryConfig>) {
        this.config = { ...this.config, ...config }
        return this
    }

    /**
     * Obtiene la lista completa de productos
     */
    async getProducts() {
        return ApiService.fetchData<ProductResponse>({
            url: `${this.config.host}/products`,
            method: 'get',
        })
    }

    /**
     * Obtiene un producto por su ID
     * @param id ID del producto
     */
    async getProductById(id: number) {
        return ApiService.fetchData<Product>({
            url: `${this.config.host}/products/${id}`,
            method: 'get',
        })
    }

    /**
     * Crea un nuevo producto
     * @param product Datos del producto
     */
    async createProduct(product: ProductInput) {
        return ApiService.fetchData<Product>({
            url: `${this.config.host}/products`,
            method: 'post',
            data: product,
        })
    }

    /**
     * Actualiza un producto existente
     * @param id ID del producto
     * @param product Datos del producto
     */
    async updateProduct(id: number, product: Partial<ProductInput>) {
        return ApiService.fetchData<Product>({
            url: `${this.config.host}/products/${id}`,
            method: 'put',
            data: product,
        })
    }

    /**
     * Elimina un producto
     * @param id ID del producto
     */
    async deleteProduct(id: number) {
        return ApiService.fetchData({
            url: `${this.config.host}/products/${id}`,
            method: 'delete',
        })
    }
}

export default new InventoryService()
