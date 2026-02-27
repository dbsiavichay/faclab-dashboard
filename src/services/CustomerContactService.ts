import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

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

export interface CustomerContactsResponse {
    data: CustomerContact[]
}

class CustomerContactService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    // Get contacts for a specific customer
    async getCustomerContacts(customerId: number) {
        return ApiService.fetchData<CustomerContactsResponse>({
            url: `${this.config.host}/customers/${customerId}/contacts`,
            method: 'get',
        })
    }

    // Get a specific contact by ID
    async getCustomerContact(id: number) {
        return ApiService.fetchData<CustomerContact>({
            url: `${this.config.host}/customer-contacts/${id}`,
            method: 'get',
        })
    }

    // Create a contact for a customer
    async createCustomerContact(
        customerId: number,
        contact: CustomerContactInput
    ) {
        return ApiService.fetchData<CustomerContact>({
            url: `${this.config.host}/customers/${customerId}/contacts`,
            method: 'post',
            data: contact,
        })
    }

    // Update a contact
    async updateCustomerContact(id: number, contact: CustomerContactInput) {
        return ApiService.fetchData<CustomerContact>({
            url: `${this.config.host}/customer-contacts/${id}`,
            method: 'put',
            data: contact,
        })
    }

    // Delete a contact
    async deleteCustomerContact(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/customer-contacts/${id}`,
            method: 'delete',
        })
    }
}

export default new CustomerContactService()
