import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type { DataResponse } from '@/@types/api'

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

class CustomerContactService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getCustomerContacts(customerId: number) {
        return ApiService.fetchData<DataResponse<CustomerContact[]>>({
            url: `${this.config.host}/customers/${customerId}/contacts`,
            method: 'get',
        })
    }

    async getCustomerContact(id: number) {
        return ApiService.fetchData<DataResponse<CustomerContact>>({
            url: `${this.config.host}/customer-contacts/${id}`,
            method: 'get',
        })
    }

    async createCustomerContact(
        customerId: number,
        contact: CustomerContactInput
    ) {
        return ApiService.fetchData<DataResponse<CustomerContact>>({
            url: `${this.config.host}/customers/${customerId}/contacts`,
            method: 'post',
            data: contact,
        })
    }

    async updateCustomerContact(id: number, contact: CustomerContactInput) {
        return ApiService.fetchData<DataResponse<CustomerContact>>({
            url: `${this.config.host}/customer-contacts/${id}`,
            method: 'put',
            data: contact,
        })
    }

    async deleteCustomerContact(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/customer-contacts/${id}`,
            method: 'delete',
        })
    }
}

export default new CustomerContactService()
