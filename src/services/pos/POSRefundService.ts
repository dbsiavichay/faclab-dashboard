import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type {
    DataResponse,
    PaginatedResponse,
    PaginationParams,
} from '@/@types/api'
import type { Refund, CreateRefundInput, ProcessRefundInput } from './POSTypes'

const HOST = appConfig.posApiHost || 'http://localhost:3000/api/pos'

export const createRefund = (data: CreateRefundInput) =>
    httpClient.post<DataResponse<Refund>>(`${HOST}/refunds`, data)

export const processRefund = (refundId: number, data: ProcessRefundInput) =>
    httpClient.post<DataResponse<Refund>>(
        `${HOST}/refunds/${refundId}/process`,
        data
    )

export const cancelRefund = (refundId: number) =>
    httpClient.post<DataResponse<Refund>>(
        `${HOST}/refunds/${refundId}/cancel`,
        undefined
    )

export const getRefund = (id: number) =>
    httpClient.get<DataResponse<Refund>>(`${HOST}/refunds/${id}`)

export const getRefunds = (params?: PaginationParams) =>
    httpClient.get<PaginatedResponse<Refund>>(`${HOST}/refunds`, { params })
