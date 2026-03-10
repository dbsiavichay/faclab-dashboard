import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type {
    DataResponse,
    PaginatedResponse,
    PaginationParams,
} from '@/@types/api'

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

class ReportService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000/api/admin',
    }

    private buildUrl(path: string, params: Record<string, string>): string {
        const queryParams = new URLSearchParams(params)
        const queryString = queryParams.toString()
        const base = `${this.config.host}/reports/inventory/${path}`
        return queryString ? `${base}?${queryString}` : base
    }

    async getValuation(params?: ValuationParams) {
        const query: Record<string, string> = {}
        if (params?.warehouseId !== undefined)
            query.warehouseId = params.warehouseId.toString()
        if (params?.asOfDate) query.asOfDate = params.asOfDate
        return ApiService.fetchData<DataResponse<InventoryValuation>>({
            url: this.buildUrl('valuation', query),
            method: 'get',
        })
    }

    async getRotation(params?: RotationParams) {
        const query: Record<string, string> = {}
        if (params?.fromDate) query.fromDate = params.fromDate
        if (params?.toDate) query.toDate = params.toDate
        if (params?.warehouseId !== undefined)
            query.warehouseId = params.warehouseId.toString()
        return ApiService.fetchData<DataResponse<ProductRotation[]>>({
            url: this.buildUrl('rotation', query),
            method: 'get',
        })
    }

    async getMovementHistory(params?: MovementHistoryParams) {
        const query: Record<string, string> = {}
        if (params?.limit !== undefined) query.limit = params.limit.toString()
        if (params?.offset !== undefined)
            query.offset = params.offset.toString()
        if (params?.productId !== undefined)
            query.productId = params.productId.toString()
        if (params?.type) query.type = params.type
        if (params?.fromDate) query.fromDate = params.fromDate
        if (params?.toDate) query.toDate = params.toDate
        if (params?.warehouseId !== undefined)
            query.warehouseId = params.warehouseId.toString()
        return ApiService.fetchData<PaginatedResponse<MovementHistoryItem>>({
            url: this.buildUrl('movements', query),
            method: 'get',
        })
    }

    async getWarehouseSummary(params?: SummaryParams) {
        const query: Record<string, string> = {}
        if (params?.warehouseId !== undefined)
            query.warehouseId = params.warehouseId.toString()
        return ApiService.fetchData<DataResponse<WarehouseSummary[]>>({
            url: this.buildUrl('summary', query),
            method: 'get',
        })
    }
}

export default new ReportService()
