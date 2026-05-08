import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type {
    DataResponse,
    PaginatedResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export interface ValuationItem {
    productId: number
    productName: string
    sku: string
    quantity: number
    averageCost: number
    totalValue: number
}

export interface InventoryValuation {
    totalValue: number
    asOfDate: string
    items: ValuationItem[]
}

export interface ValuationParams {
    warehouseId?: number
    asOfDate?: string
}

export interface ProductRotation {
    productId: number
    productName: string
    sku: string
    totalIn: number
    totalOut: number
    currentStock: number
    turnoverRate: number
    daysOfStock: number | null
}

export interface RotationParams {
    fromDate?: string
    toDate?: string
    warehouseId?: number
}

export interface MovementHistoryItem {
    id: number
    productId: number
    productName: string
    sku: string
    quantity: number
    type: 'in' | 'out'
    locationId: number | null
    sourceLocationId: number | null
    referenceType: string | null
    referenceId: number | null
    reason: string | null
    date: string | null
    createdAt: string | null
}

export interface MovementHistoryParams extends PaginationParams {
    productId?: number
    type?: 'in' | 'out'
    fromDate?: string
    toDate?: string
    warehouseId?: number
}

export interface WarehouseSummary {
    warehouseId: number
    warehouseName: string
    warehouseCode: string
    totalProducts: number
    totalQuantity: number
    reservedQuantity: number
    availableQuantity: number
    totalValue: number
}

export interface SummaryParams {
    warehouseId?: number
}

export const getValuation = (params?: ValuationParams) =>
    httpClient.get<DataResponse<InventoryValuation>>(
        `${HOST}/reports/inventory/valuation`,
        { params }
    )

export const getRotation = (params?: RotationParams) =>
    httpClient.get<DataResponse<ProductRotation[]>>(
        `${HOST}/reports/inventory/rotation`,
        { params }
    )

export const getMovementHistory = (params?: MovementHistoryParams) =>
    httpClient.get<PaginatedResponse<MovementHistoryItem>>(
        `${HOST}/reports/inventory/movements`,
        { params }
    )

export const getWarehouseSummary = (params?: SummaryParams) =>
    httpClient.get<DataResponse<WarehouseSummary[]>>(
        `${HOST}/reports/inventory/summary`,
        { params }
    )
