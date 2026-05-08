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

export interface Customer {
    id: number
    name: string
    taxId: string
    taxType: TaxType
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    country?: string | null
    creditLimit?: number | null
    paymentTerms?: number | null
    isActive: boolean
}

export interface CustomerInput {
    name: string
    taxId: string
    taxType: TaxType
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    country?: string
    creditLimit?: number
    paymentTerms?: number
    isActive?: boolean
}

export const getCustomers = (params?: PaginationParams) =>
    httpClient.get<PaginatedResponse<Customer>>(`${HOST}/customers`, { params })

export const getCustomer = (id: number) =>
    httpClient.get<DataResponse<Customer>>(`${HOST}/customers/${id}`)

export const searchCustomerByTaxId = (taxId: string) =>
    httpClient.get<DataResponse<Customer>>(
        `${HOST}/customers/search/by-tax-id`,
        { params: { tax_id: taxId } }
    )

export const createCustomer = (customer: CustomerInput) =>
    httpClient.post<DataResponse<Customer>>(`${HOST}/customers`, customer)

export const updateCustomer = (id: number, customer: CustomerInput) =>
    httpClient.put<DataResponse<Customer>>(`${HOST}/customers/${id}`, customer)

export const deleteCustomer = (id: number) =>
    httpClient.delete(`${HOST}/customers/${id}`)

export const activateCustomer = (id: number) =>
    httpClient.post<DataResponse<Customer>>(`${HOST}/customers/${id}/activate`)

export const deactivateCustomer = (id: number) =>
    httpClient.post<DataResponse<Customer>>(
        `${HOST}/customers/${id}/deactivate`
    )
