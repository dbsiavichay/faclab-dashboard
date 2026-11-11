import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type { DataResponse, PaginatedResponse } from '@/@types/api'
import type {
    PriceList,
    PriceListInput,
    PriceListItem,
    PriceListItemCreateInput,
    PriceListItemParams,
    PriceListItemUpdateInput,
    PriceListParams,
} from '../model/types'

const HOST = appConfig.inventoryApiHost

// Los PUT reemplazan el registro completo (`isActive` y la vigencia incluidos)

export const getPriceLists = (params?: PriceListParams) =>
    httpClient.get<PaginatedResponse<PriceList>>(`${HOST}/price-lists`, {
        params,
    })

export const getPriceList = (id: number) =>
    httpClient.get<DataResponse<PriceList>>(`${HOST}/price-lists/${id}`)

export const createPriceList = (data: PriceListInput) =>
    httpClient.post<DataResponse<PriceList>>(`${HOST}/price-lists`, data)

export const updatePriceList = (id: number, data: PriceListInput) =>
    httpClient.put<DataResponse<PriceList>>(`${HOST}/price-lists/${id}`, data)

export const deletePriceList = (id: number) =>
    httpClient.delete(`${HOST}/price-lists/${id}`)

export const getPriceListItems = (
    priceListId: number,
    params?: PriceListItemParams
) =>
    httpClient.get<PaginatedResponse<PriceListItem>>(
        `${HOST}/price-lists/${priceListId}/items`,
        { params }
    )

export const createPriceListItem = (
    priceListId: number,
    data: PriceListItemCreateInput
) =>
    httpClient.post<DataResponse<PriceListItem>>(
        `${HOST}/price-lists/${priceListId}/items`,
        data
    )

export const updatePriceListItem = (
    priceListId: number,
    itemId: number,
    data: PriceListItemUpdateInput
) =>
    httpClient.put<DataResponse<PriceListItem>>(
        `${HOST}/price-lists/${priceListId}/items/${itemId}`,
        data
    )

export const deletePriceListItem = (priceListId: number, itemId: number) =>
    httpClient.delete(`${HOST}/price-lists/${priceListId}/items/${itemId}`)
