import ApiService from '@/services/ApiService'
import appConfig from '@/configs/app.config'
import type { DataResponse } from '@/@types/api'
import type { POSCustomer, QuickCustomerInput, ListResponse } from './POSTypes'

class POSCustomerService {
    private host = appConfig.posApiHost || 'http://localhost:3000/api/pos'

    async getCustomers() {
        return ApiService.fetchData<ListResponse<POSCustomer>>({
            url: `${this.host}/customers`,
            method: 'get',
        })
    }

    async searchCustomerByTaxId(taxId: string) {
        return ApiService.fetchData<DataResponse<POSCustomer>>({
            url: `${this.host}/customers/search/by-tax-id?taxId=${taxId}`,
            method: 'get',
        })
    }

    async quickCreateCustomer(data: QuickCustomerInput) {
        return ApiService.fetchData<DataResponse<POSCustomer>>({
            url: `${this.host}/customers`,
            method: 'post',
            data,
        })
    }

    async getCustomer(id: number) {
        return ApiService.fetchData<DataResponse<POSCustomer>>({
            url: `${this.host}/customers/${id}`,
            method: 'get',
        })
    }
}

export default new POSCustomerService()
