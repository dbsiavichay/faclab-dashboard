import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse, PaginatedResponse } from '@/@types/api'
import type {
    Aging,
    CustomerAccount,
    CustomerPayment,
    CustomerPaymentInput,
    CustomerPaymentSummary,
    Receivable,
    ReceivableDetail,
    ReceivableParams,
    Statement,
    StatementParams,
} from '../model/types'

const HOST = appConfig.inventoryApiHost

export const getReceivables = (params?: ReceivableParams) =>
    httpClient.get<PaginatedResponse<Receivable>>(`${HOST}/receivables`, {
        params,
    })

export const getReceivable = (id: number) =>
    httpClient.get<DataResponse<ReceivableDetail>>(`${HOST}/receivables/${id}`)

/** Lo que debe cada cliente por días de vencido, a hoy */
export const getAging = (branchId?: number) =>
    httpClient.get<DataResponse<Aging>>(`${HOST}/receivables/aging`, {
        params: branchId ? { branchId } : undefined,
    })

export const getCustomerAccount = (customerId: number) =>
    httpClient.get<DataResponse<CustomerAccount>>(
        `${HOST}/customer-accounts/${customerId}`
    )

export const getStatement = (customerId: number, params?: StatementParams) =>
    httpClient.get<DataResponse<Statement>>(
        `${HOST}/customer-accounts/${customerId}/statement`,
        { params }
    )

/** Un abono fuera de la caja: transferencia, cheque, efectivo en oficina */
export const createCustomerPayment = (data: CustomerPaymentInput) =>
    httpClient.post<DataResponse<CustomerPayment>>(
        `${HOST}/customer-payments`,
        data
    )

export const getCustomerPayments = (params?: {
    customerId?: number
    limit?: number
    offset?: number
}) =>
    httpClient.get<PaginatedResponse<CustomerPaymentSummary>>(
        `${HOST}/customer-payments`,
        { params }
    )

export const getCustomerPayment = (id: number) =>
    httpClient.get<DataResponse<CustomerPayment>>(
        `${HOST}/customer-payments/${id}`
    )
