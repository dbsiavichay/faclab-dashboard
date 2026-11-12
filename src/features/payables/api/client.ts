import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse, PaginatedResponse } from '@/@types/api'
import type {
    Payable,
    PayableDetail,
    PayableParams,
    SupplierAccount,
    SupplierPayment,
    SupplierPaymentInput,
    SupplierPaymentSummary,
} from '../model/types'

const HOST = appConfig.inventoryApiHost

export const getPayables = (params?: PayableParams) =>
    httpClient.get<PaginatedResponse<Payable>>(`${HOST}/payables`, { params })

export const getPayable = (id: number) =>
    httpClient.get<DataResponse<PayableDetail>>(`${HOST}/payables/${id}`)

export const getSupplierAccount = (supplierId: number) =>
    httpClient.get<DataResponse<SupplierAccount>>(
        `${HOST}/supplier-accounts/${supplierId}`
    )

/** Un pago al proveedor, fuera de la caja del POS */
export const createSupplierPayment = (data: SupplierPaymentInput) =>
    httpClient.post<DataResponse<SupplierPayment>>(
        `${HOST}/supplier-payments`,
        data
    )

export const getSupplierPayments = (params?: {
    supplierId?: number
    limit?: number
    offset?: number
}) =>
    httpClient.get<PaginatedResponse<SupplierPaymentSummary>>(
        `${HOST}/supplier-payments`,
        { params }
    )

export const getSupplierPayment = (id: number) =>
    httpClient.get<DataResponse<SupplierPayment>>(
        `${HOST}/supplier-payments/${id}`
    )
