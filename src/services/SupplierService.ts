import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export type TaxType = 1 | 2 | 3 | 4

export const TAX_TYPE_LABELS: Record<TaxType, string> = {
    1: 'RUC',
    2: 'Cédula',
    3: 'Pasaporte',
    4: 'ID Extranjero',
}

export interface Supplier {
    id: number
    name: string
    taxId: string
    taxType: TaxType
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
    paymentTerms?: number | null
    leadTimeDays?: number | null
    notes?: string | null
    isActive: boolean
}

export interface SupplierInput {
    name: string
    taxId: string
    taxType: TaxType
    email?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    paymentTerms?: number
    leadTimeDays?: number
    notes?: string
    isActive?: boolean
}

export const getSuppliers = (
    params?: PaginationParams & { isActive?: boolean }
) =>
    httpClient.get<PaginatedResponse<Supplier>>(`${HOST}/suppliers`, { params })

export const getSupplier = (id: number) =>
    httpClient.get<DataResponse<Supplier>>(`${HOST}/suppliers/${id}`)

export const createSupplier = (supplier: SupplierInput) =>
    httpClient.post<DataResponse<Supplier>>(`${HOST}/suppliers`, supplier)

export const updateSupplier = (id: number, supplier: SupplierInput) =>
    httpClient.put<DataResponse<Supplier>>(`${HOST}/suppliers/${id}`, supplier)

export const deleteSupplier = (id: number) =>
    httpClient.delete(`${HOST}/suppliers/${id}`)

export const activateSupplier = (id: number) =>
    httpClient.post<DataResponse<Supplier>>(`${HOST}/suppliers/${id}/activate`)

export const deactivateSupplier = (id: number) =>
    httpClient.post<DataResponse<Supplier>>(
        `${HOST}/suppliers/${id}/deactivate`
    )
