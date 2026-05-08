import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type { DataResponse } from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export interface CustomerContact {
    id: number
    customerId: number
    name: string
    role?: string | null
    email?: string | null
    phone?: string | null
}

export interface CustomerContactInput {
    name: string
    role?: string
    email?: string
    phone?: string
}

export const getCustomerContacts = (customerId: number) =>
    httpClient.get<DataResponse<CustomerContact[]>>(
        `${HOST}/customers/${customerId}/contacts`
    )

export const getCustomerContact = (id: number) =>
    httpClient.get<DataResponse<CustomerContact>>(
        `${HOST}/customer-contacts/${id}`
    )

export const createCustomerContact = (
    customerId: number,
    contact: CustomerContactInput
) =>
    httpClient.post<DataResponse<CustomerContact>>(
        `${HOST}/customers/${customerId}/contacts`,
        contact
    )

export const updateCustomerContact = (
    id: number,
    contact: CustomerContactInput
) =>
    httpClient.put<DataResponse<CustomerContact>>(
        `${HOST}/customer-contacts/${id}`,
        contact
    )

export const deleteCustomerContact = (id: number) =>
    httpClient.delete(`${HOST}/customer-contacts/${id}`)
