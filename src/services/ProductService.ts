import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

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

export const getProducts = (params?: ProductQueryParams) =>
    httpClient.get<PaginatedResponse<Product>>(`${HOST}/products`, { params })

export const getProductById = (id: number) =>
    httpClient.get<DataResponse<Product>>(`${HOST}/products/${id}`)

export const createProduct = (product: ProductInput) =>
    httpClient.post<DataResponse<Product>>(`${HOST}/products`, product)

export const updateProduct = (id: number, product: Partial<ProductInput>) =>
    httpClient.put<DataResponse<Product>>(`${HOST}/products/${id}`, product)

export const deleteProduct = (id: number) =>
    httpClient.delete(`${HOST}/products/${id}`)
