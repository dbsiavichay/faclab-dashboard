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

export interface Supplier {
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
    state?: string
    country?: string
    creditLimit?: number
    paymentTerms?: number
    leadTimeDays?: number
    notes?: string
    isActive?: boolean
}

export interface SuppliersResponse {
    data: Supplier[]
}

class SupplierService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getSuppliers() {
        return ApiService.fetchData<SuppliersResponse>({
            url: `${this.config.host}/suppliers`,
            method: 'get',
        })
    }

    async getSupplier(id: number) {
        return ApiService.fetchData<Supplier>({
            url: `${this.config.host}/suppliers/${id}`,
            method: 'get',
        })
    }

    async createSupplier(supplier: SupplierInput) {
        return ApiService.fetchData<Supplier>({
            url: `${this.config.host}/suppliers`,
            method: 'post',
            data: supplier,
        })
    }

    async updateSupplier(id: number, supplier: SupplierInput) {
        return ApiService.fetchData<Supplier>({
            url: `${this.config.host}/suppliers/${id}`,
            method: 'put',
            data: supplier,
        })
    }

    async deleteSupplier(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/suppliers/${id}`,
            method: 'delete',
        })
    }

    async activateSupplier(id: number) {
        return ApiService.fetchData<Supplier>({
            url: `${this.config.host}/suppliers/${id}/activate`,
            method: 'post',
        })
    }

    async deactivateSupplier(id: number) {
        return ApiService.fetchData<Supplier>({
            url: `${this.config.host}/suppliers/${id}/deactivate`,
            method: 'post',
        })
    }
}

export default new SupplierService()
