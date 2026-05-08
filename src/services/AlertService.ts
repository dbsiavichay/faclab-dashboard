import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export type AlertType =
    | 'low_stock'
    | 'out_of_stock'
    | 'reorder_point'
    | 'expiring_soon'

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
    low_stock: 'Stock Bajo',
    out_of_stock: 'Sin Stock',
    reorder_point: 'Punto de Reorden',
    expiring_soon: 'Por Vencer',
}

export const ALERT_TYPE_CLASSES: Record<AlertType, string> = {
    low_stock:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    out_of_stock:
        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    reorder_point:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    expiring_soon:
        'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

export interface StockAlert {
    type: AlertType
    productId: number
    productName: string
    sku: string
    currentQuantity: number
    threshold: number
    warehouseId: number | null
    lotId: number | null
    daysToExpiry: number | null
}

export interface StockAlertQueryParams {
    warehouseId?: number
}

export interface ExpiringLotsQueryParams {
    days?: number
}

interface AlertsResponse {
    data: StockAlert[]
}

export const getLowStock = (params?: StockAlertQueryParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/low-stock`, { params })

export const getOutOfStock = (params?: StockAlertQueryParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/out-of-stock`, { params })

export const getReorderPoint = (params?: StockAlertQueryParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/reorder-point`, { params })

export const getExpiringLots = (params?: ExpiringLotsQueryParams) =>
    httpClient.get<AlertsResponse>(`${HOST}/alerts/expiring-lots`, { params })
