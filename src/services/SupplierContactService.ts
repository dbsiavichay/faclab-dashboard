import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

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

export interface SupplierContactsResponse {
    data: SupplierContact[]
}

class SupplierContactService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getSupplierContacts(supplierId: number) {
        return ApiService.fetchData<SupplierContactsResponse>({
            url: `${this.config.host}/suppliers/${supplierId}/contacts`,
            method: 'get',
        })
    }

    async getSupplierContact(id: number) {
        return ApiService.fetchData<SupplierContact>({
            url: `${this.config.host}/supplier-contacts/${id}`,
            method: 'get',
        })
    }

    async createSupplierContact(
        supplierId: number,
        contact: SupplierContactInput
    ) {
        return ApiService.fetchData<SupplierContact>({
            url: `${this.config.host}/suppliers/${supplierId}/contacts`,
            method: 'post',
            data: contact,
        })
    }

    async updateSupplierContact(id: number, contact: SupplierContactInput) {
        return ApiService.fetchData<SupplierContact>({
            url: `${this.config.host}/supplier-contacts/${id}`,
            method: 'put',
            data: contact,
        })
    }

    async deleteSupplierContact(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/supplier-contacts/${id}`,
            method: 'delete',
        })
    }
}

export default new SupplierContactService()
