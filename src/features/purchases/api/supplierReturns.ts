import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse, PaginatedResponse } from '@/@types/api'
import type {
    SupplierReturn,
    SupplierReturnInput,
    SupplierReturnItem,
    SupplierReturnItemInput,
    SupplierReturnItemUpdateInput,
    SupplierReturnListParams,
} from '../model/types'

const HOST = appConfig.inventoryApiHost

interface SupplierReturnItemsResponse {
    data: SupplierReturnItem[]
    meta: { requestId: string; timestamp: string }
}

export async function getSupplierReturns(params?: SupplierReturnListParams) {
    return httpClient.get<PaginatedResponse<SupplierReturn>>(
        `${HOST}/supplier-returns`,
        { params }
    )
}

export async function getSupplierReturn(id: number) {
    return httpClient.get<DataResponse<SupplierReturn>>(
        `${HOST}/supplier-returns/${id}`
    )
}

export async function createSupplierReturn(data: SupplierReturnInput) {
    return httpClient.post<DataResponse<SupplierReturn>>(
        `${HOST}/supplier-returns`,
        data
    )
}

export async function updateSupplierReturn(
    id: number,
    data: { notes: string | null }
) {
    return httpClient.put<DataResponse<SupplierReturn>>(
        `${HOST}/supplier-returns/${id}`,
        data
    )
}

export async function deleteSupplierReturn(id: number) {
    return httpClient.delete(`${HOST}/supplier-returns/${id}`)
}

export async function confirmSupplierReturn(
    id: number,
    data: { supplierCreditNoteNumber?: string | null }
) {
    return httpClient.post<DataResponse<SupplierReturn>>(
        `${HOST}/supplier-returns/${id}/confirm`,
        data
    )
}

export async function getSupplierReturnItems(id: number) {
    return httpClient.get<SupplierReturnItemsResponse>(
        `${HOST}/supplier-returns/${id}/items`
    )
}

export async function addSupplierReturnItem(
    id: number,
    data: SupplierReturnItemInput
) {
    return httpClient.post<DataResponse<SupplierReturnItem>>(
        `${HOST}/supplier-returns/${id}/items`,
        data
    )
}

export async function updateSupplierReturnItem(
    itemId: number,
    data: SupplierReturnItemUpdateInput
) {
    return httpClient.put<DataResponse<SupplierReturnItem>>(
        `${HOST}/supplier-return-items/${itemId}`,
        data
    )
}

export async function deleteSupplierReturnItem(itemId: number) {
    return httpClient.delete(`${HOST}/supplier-return-items/${itemId}`)
}
