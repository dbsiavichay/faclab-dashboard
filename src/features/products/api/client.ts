import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type { PaginatedResponse, DataResponse } from '@/@types/api'
import type {
    Product,
    ProductInput,
    ProductListParams,
    ProductPresentation,
    ProductPresentationInput,
} from '../model/types'

const HOST = appConfig.inventoryApiHost

export const getProducts = (params?: ProductListParams) =>
    httpClient.get<PaginatedResponse<Product>>(`${HOST}/products`, { params })

export const getProductById = (id: number) =>
    httpClient.get<DataResponse<Product>>(`${HOST}/products/${id}`)

export const createProduct = (data: ProductInput) =>
    httpClient.post<DataResponse<Product>>(`${HOST}/products`, data)

export const updateProduct = (id: number, data: Partial<ProductInput>) =>
    httpClient.put<DataResponse<Product>>(`${HOST}/products/${id}`, data)

export const deleteProduct = (id: number) =>
    httpClient.delete(`${HOST}/products/${id}`)

export const getProductPresentations = (productId: number) =>
    httpClient.get<DataResponse<ProductPresentation[]>>(
        `${HOST}/products/${productId}/presentations`
    )

export const createProductPresentation = (
    productId: number,
    data: ProductPresentationInput
) =>
    httpClient.post<DataResponse<ProductPresentation>>(
        `${HOST}/products/${productId}/presentations`,
        data
    )

export const updateProductPresentation = (
    productId: number,
    presentationId: number,
    data: ProductPresentationInput
) =>
    httpClient.put<DataResponse<ProductPresentation>>(
        `${HOST}/products/${productId}/presentations/${presentationId}`,
        data
    )

export const deleteProductPresentation = (
    productId: number,
    presentationId: number
) =>
    httpClient.delete(
        `${HOST}/products/${productId}/presentations/${presentationId}`
    )
