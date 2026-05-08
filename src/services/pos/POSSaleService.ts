import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse } from '@/@types/api'
import type {
    POSSale,
    POSSaleItem,
    POSPayment,
    CreateSaleInput,
    QuickSaleInput,
    AddSaleItemInput,
    UpdateSaleItemInput,
    SaleDiscountInput,
    PriceOverrideInput,
    PaymentInput,
    Receipt,
    ListResponse,
} from './POSTypes'

const HOST = appConfig.posApiHost || 'http://localhost:3000/api/pos'

export const createSale = (data: CreateSaleInput) =>
    httpClient.post<DataResponse<POSSale>>(`${HOST}/sales`, data)

export const quickSale = (data: QuickSaleInput) =>
    httpClient.post<DataResponse<POSSale>>(`${HOST}/sales/quick`, data)

export const getSale = (id: number) =>
    httpClient.get<DataResponse<POSSale>>(`${HOST}/sales/${id}`)

export const addSaleItem = (saleId: number, data: AddSaleItemInput) =>
    httpClient.post<DataResponse<POSSaleItem>>(
        `${HOST}/sales/${saleId}/items`,
        data
    )

export const getSaleItems = (saleId: number) =>
    httpClient.get<ListResponse<POSSaleItem>>(`${HOST}/sales/${saleId}/items`)

export const updateSaleItem = (
    saleId: number,
    itemId: number,
    data: UpdateSaleItemInput
) =>
    httpClient.put<DataResponse<POSSaleItem>>(
        `${HOST}/sales/${saleId}/items/${itemId}`,
        data
    )

export const deleteSaleItem = (saleId: number, itemId: number) =>
    httpClient.delete<void>(`${HOST}/sales/${saleId}/items/${itemId}`)

export const confirmSale = (saleId: number) =>
    httpClient.post<DataResponse<POSSale>>(
        `${HOST}/sales/${saleId}/confirm`,
        undefined
    )

export const cancelSale = (saleId: number, reason?: string) =>
    httpClient.post<DataResponse<POSSale>>(
        `${HOST}/sales/${saleId}/cancel`,
        reason ? { reason } : undefined
    )

export const parkSale = (saleId: number, reason?: string) =>
    httpClient.post<DataResponse<POSSale>>(
        `${HOST}/sales/${saleId}/park`,
        reason ? { reason } : undefined
    )

export const resumeSale = (saleId: number) =>
    httpClient.post<DataResponse<POSSale>>(
        `${HOST}/sales/${saleId}/resume`,
        undefined
    )

export const getParkedSales = () =>
    httpClient.get<ListResponse<POSSale>>(`${HOST}/sales/parked`)

export const applySaleDiscount = (saleId: number, data: SaleDiscountInput) =>
    httpClient.post<DataResponse<POSSale>>(
        `${HOST}/sales/${saleId}/discount`,
        data
    )

export const addPayment = (saleId: number, data: PaymentInput) =>
    httpClient.post<DataResponse<POSPayment>>(
        `${HOST}/sales/${saleId}/payments`,
        data
    )

export const getSalePayments = (saleId: number) =>
    httpClient.get<ListResponse<POSPayment>>(`${HOST}/sales/${saleId}/payments`)

export const overrideItemPrice = (
    saleId: number,
    itemId: number,
    data: PriceOverrideInput
) =>
    httpClient.put<DataResponse<POSSaleItem>>(
        `${HOST}/sales/${saleId}/items/${itemId}/price`,
        data
    )

export const getReceipt = (saleId: number) =>
    httpClient.get<DataResponse<Receipt>>(`${HOST}/sales/${saleId}/receipt`)
