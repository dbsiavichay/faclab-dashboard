import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse } from '@/@types/api'

export interface SupplierProduct {
    id: number
    supplierId: number
    productId: number
    purchasePrice: number
    supplierSku?: string | null
    minOrderQuantity?: number | null
    leadTimeDays?: number | null
    isPreferred: boolean
}

export interface SupplierProductInput {
    productId: number
    purchasePrice: number
    supplierSku?: string
    minOrderQuantity?: number
    leadTimeDays?: number
    isPreferred?: boolean
}

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export async function getSupplierProducts(supplierId: number) {
    return httpClient.get<DataResponse<SupplierProduct[]>>(
        `${HOST}/suppliers/${supplierId}/products`
    )
}

export async function createSupplierProduct(
    supplierId: number,
    product: SupplierProductInput
) {
    return httpClient.post<DataResponse<SupplierProduct>>(
        `${HOST}/suppliers/${supplierId}/products`,
        product
    )
}

export async function updateSupplierProduct(
    id: number,
    product: SupplierProductInput
) {
    return httpClient.put<DataResponse<SupplierProduct>>(
        `${HOST}/supplier-products/${id}`,
        product
    )
}

export async function deleteSupplierProduct(id: number) {
    return httpClient.delete<void>(`${HOST}/supplier-products/${id}`)
}

export async function getSupplierProductsByProduct(productId: number) {
    return httpClient.get<DataResponse<SupplierProduct[]>>(
        `${HOST}/supplier-products/by-product/${productId}`
    )
}
