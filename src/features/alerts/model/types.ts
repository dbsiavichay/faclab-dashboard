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

export interface StockAlertParams {
    warehouseId?: number
}

export interface ExpiringLotsParams {
    days?: number
}
