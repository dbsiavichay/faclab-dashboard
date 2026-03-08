import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

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

class SupplierService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getSuppliers(params?: PaginationParams & { isActive?: boolean }) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined)
            queryParams.append('limit', params.limit.toString())
        if (params?.offset !== undefined)
            queryParams.append('offset', params.offset.toString())
        if (params?.isActive !== undefined)
            queryParams.append('isActive', params.isActive.toString())
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/suppliers?${queryString}`
            : `${this.config.host}/suppliers`
        return ApiService.fetchData<PaginatedResponse<Supplier>>({
            url,
            method: 'get',
        })
    }

    async getSupplier(id: number) {
        return ApiService.fetchData<DataResponse<Supplier>>({
            url: `${this.config.host}/suppliers/${id}`,
            method: 'get',
        })
    }

    async createSupplier(supplier: SupplierInput) {
        return ApiService.fetchData<DataResponse<Supplier>>({
            url: `${this.config.host}/suppliers`,
            method: 'post',
            data: supplier,
        })
    }

    async updateSupplier(id: number, supplier: SupplierInput) {
        return ApiService.fetchData<DataResponse<Supplier>>({
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
        return ApiService.fetchData<DataResponse<Supplier>>({
            url: `${this.config.host}/suppliers/${id}/activate`,
            method: 'post',
        })
    }

    async deactivateSupplier(id: number) {
        return ApiService.fetchData<DataResponse<Supplier>>({
            url: `${this.config.host}/suppliers/${id}/deactivate`,
            method: 'post',
        })
    }
}

export default new SupplierService()
