import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    StockAlert,
    StockAlertParams,
    ExpiringLotsParams,
} from '../model/types'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

interface AlertsResponse {
    data: StockAlert[]
}

export const getLowStock = (params?: StockAlertParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/low-stock`, { params })

export const getOutOfStock = (params?: StockAlertParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/out-of-stock`, { params })

export const getReorderPoint = (params?: StockAlertParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/reorder-point`, { params })

export const getExpiringLots = (params?: ExpiringLotsParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/expiring-lots`, { params })
