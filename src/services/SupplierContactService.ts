import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse } from '@/@types/api'

export interface SupplierContact {
    id: number
    supplierId: number
    name: string
    role?: string | null
    email?: string | null
    phone?: string | null
}

export interface SupplierContactInput {
    name: string
    role?: string
    email?: string
    phone?: string
}

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export async function getSupplierContacts(supplierId: number) {
    return httpClient.get<DataResponse<SupplierContact[]>>(
        `${HOST}/suppliers/${supplierId}/contacts`
    )
}

export async function getSupplierContact(id: number) {
    return httpClient.get<DataResponse<SupplierContact>>(
        `${HOST}/supplier-contacts/${id}`
    )
}

export async function createSupplierContact(
    supplierId: number,
    contact: SupplierContactInput
) {
    return httpClient.post<DataResponse<SupplierContact>>(
        `${HOST}/suppliers/${supplierId}/contacts`,
        contact
    )
}

export async function updateSupplierContact(
    id: number,
    contact: SupplierContactInput
) {
    return httpClient.put<DataResponse<SupplierContact>>(
        `${HOST}/supplier-contacts/${id}`,
        contact
    )
}

export async function deleteSupplierContact(id: number) {
    return httpClient.delete<void>(`${HOST}/supplier-contacts/${id}`)
}
