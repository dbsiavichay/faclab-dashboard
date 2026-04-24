import ApiService from '@/services/ApiService'
import appConfig from '@/configs/app.config'
import type {
    DataResponse,
    PaginatedResponse,
    PaginationParams,
} from '@/@types/api'
import type { Refund, CreateRefundInput, ProcessRefundInput } from './POSTypes'

class POSRefundService {
    private host = appConfig.posApiHost || 'http://localhost:3000/api/pos'

    async createRefund(data: CreateRefundInput) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.host}/refunds`,
            method: 'post',
            data,
        })
    }

    async processRefund(refundId: number, data: ProcessRefundInput) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.host}/refunds/${refundId}/process`,
            method: 'post',
            data,
        })
    }

    async cancelRefund(refundId: number) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.host}/refunds/${refundId}/cancel`,
            method: 'post',
        })
    }

    async getRefund(id: number) {
        return ApiService.fetchData<DataResponse<Refund>>({
            url: `${this.host}/refunds/${id}`,
            method: 'get',
        })
    }

    async getRefunds(params?: PaginationParams) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.host}/refunds?${queryString}`
            : `${this.host}/refunds`
        return ApiService.fetchData<PaginatedResponse<Refund>>({
            url,
            method: 'get',
        })
    }
}

export default new POSRefundService()
