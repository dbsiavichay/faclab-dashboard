import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

export interface SupplierProduct {
    id: number
    supplierId: number
    productId: number
    purchasePrice: number
    supplierSku?: string | null
    minOrderQuantity?: number | null
    leadTimeDays?: number | null
    isPreferred: boolean
    createdAt?: string
    updatedAt?: string
}

export interface SupplierProductInput {
    [key: string]: unknown
    productId: number
    purchasePrice: number
    supplierSku?: string
    minOrderQuantity?: number
    leadTimeDays?: number
    isPreferred?: boolean
}

export interface SupplierProductsResponse {
    data: SupplierProduct[]
}

class SupplierProductService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getSupplierProducts(supplierId: number) {
        return ApiService.fetchData<SupplierProductsResponse>({
            url: `${this.config.host}/suppliers/${supplierId}/products`,
            method: 'get',
        })
    }

    async createSupplierProduct(
        supplierId: number,
        product: SupplierProductInput
    ) {
        return ApiService.fetchData<SupplierProduct>({
            url: `${this.config.host}/suppliers/${supplierId}/products`,
            method: 'post',
            data: product,
        })
    }

    async updateSupplierProduct(id: number, product: SupplierProductInput) {
        return ApiService.fetchData<SupplierProduct>({
            url: `${this.config.host}/supplier-products/${id}`,
            method: 'put',
            data: product,
        })
    }

    async deleteSupplierProduct(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/supplier-products/${id}`,
            method: 'delete',
        })
    }

    async getSupplierProductsByProduct(productId: number) {
        return ApiService.fetchData<SupplierProductsResponse>({
            url: `${this.config.host}/supplier-products/by-product/${productId}`,
            method: 'get',
        })
    }
}

export default new SupplierProductService()
