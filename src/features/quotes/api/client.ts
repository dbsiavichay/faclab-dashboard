import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse, PaginatedResponse } from '@/@types/api'
import type {
    Quote,
    QuoteInput,
    QuoteItemInput,
    QuoteItemUpdateInput,
    QuoteParams,
    QuoteSummary,
    QuoteUpdateInput,
} from '../model/types'

const HOST = `${appConfig.inventoryApiHost}/quotes`

export const getQuotes = (params?: QuoteParams) =>
    httpClient.get<PaginatedResponse<QuoteSummary>>(HOST, { params })

export const getQuote = (id: number) =>
    httpClient.get<DataResponse<Quote>>(`${HOST}/${id}`)

export const createQuote = (data: QuoteInput) =>
    httpClient.post<DataResponse<Quote>>(HOST, data)

export const updateQuote = (id: number, data: QuoteUpdateInput) =>
    httpClient.put<DataResponse<Quote>>(`${HOST}/${id}`, data)

export const deleteQuote = (id: number) => httpClient.delete(`${HOST}/${id}`)

export const addQuoteItem = (id: number, data: QuoteItemInput) =>
    httpClient.post<DataResponse<Quote>>(`${HOST}/${id}/items`, data)

export const updateQuoteItem = (
    id: number,
    itemId: number,
    data: QuoteItemUpdateInput
) => httpClient.put<DataResponse<Quote>>(`${HOST}/${id}/items/${itemId}`, data)

export const removeQuoteItem = (id: number, itemId: number) =>
    httpClient.delete<DataResponse<Quote>>(`${HOST}/${id}/items/${itemId}`)

/** Entregada al cliente impresa o a mano */
export const sendQuote = (id: number) =>
    httpClient.post<DataResponse<Quote>>(`${HOST}/${id}/send`)

export const acceptQuote = (id: number) =>
    httpClient.post<DataResponse<Quote>>(`${HOST}/${id}/accept`)

/** Una vencida vuelve a regir: borrador, emitida hoy, con los precios de hoy */
export const renewQuote = (id: number, validUntil: string) =>
    httpClient.post<DataResponse<Quote>>(`${HOST}/${id}/renew`, { validUntil })

/** Envía su PDF; sin `to`, al correo del cliente */
export const emailQuote = (id: number, to: string | null) =>
    httpClient.post<DataResponse<Quote>>(`${HOST}/${id}/email`, { to })

export const downloadQuotePdf = (id: number) =>
    httpClient.getBlob(`${HOST}/${id}/pdf`)
