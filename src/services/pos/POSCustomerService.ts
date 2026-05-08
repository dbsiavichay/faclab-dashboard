import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse } from '@/@types/api'
import type { POSCustomer, QuickCustomerInput, ListResponse } from './POSTypes'

const HOST = appConfig.posApiHost || 'http://localhost:3000/api/pos'

export const getCustomers = () =>
    httpClient.get<ListResponse<POSCustomer>>(`${HOST}/customers`)

export const searchCustomerByTaxId = (taxId: string) =>
    httpClient.get<DataResponse<POSCustomer>>(
        `${HOST}/customers/search/by-tax-id`,
        { params: { taxId } }
    )

export const quickCreateCustomer = (data: QuickCustomerInput) =>
    httpClient.post<DataResponse<POSCustomer>>(`${HOST}/customers`, data)

export const getCustomer = (id: number) =>
    httpClient.get<DataResponse<POSCustomer>>(`${HOST}/customers/${id}`)
