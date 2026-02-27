import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

// TaxType enum: 1=RUC, 2=NATIONAL_ID, 3=PASSPORT, 4=FOREIGN_ID
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

export interface CustomersResponse {
    data: Customer[]
}

class CustomerService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getCustomers() {
        return ApiService.fetchData<CustomersResponse>({
            url: `${this.config.host}/customers`,
            method: 'get',
        })
    }

    async getCustomer(id: number) {
        return ApiService.fetchData<Customer>({
            url: `${this.config.host}/customers/${id}`,
            method: 'get',
        })
    }

    async searchCustomerByTaxId(taxId: string) {
        return ApiService.fetchData<Customer>({
            url: `${this.config.host}/customers/search/by-tax-id?tax_id=${taxId}`,
            method: 'get',
        })
    }

    async createCustomer(customer: CustomerInput) {
        return ApiService.fetchData<Customer>({
            url: `${this.config.host}/customers`,
            method: 'post',
            data: customer,
        })
    }

    async updateCustomer(id: number, customer: CustomerInput) {
        return ApiService.fetchData<Customer>({
            url: `${this.config.host}/customers/${id}`,
            method: 'put',
            data: customer,
        })
    }

    async deleteCustomer(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/customers/${id}`,
            method: 'delete',
        })
    }

    async activateCustomer(id: number) {
        return ApiService.fetchData<Customer>({
            url: `${this.config.host}/customers/${id}/activate`,
            method: 'post',
        })
    }

    async deactivateCustomer(id: number) {
        return ApiService.fetchData<Customer>({
            url: `${this.config.host}/customers/${id}/deactivate`,
            method: 'post',
        })
    }
}

export default new CustomerService()
