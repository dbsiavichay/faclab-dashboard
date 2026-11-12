import type { PaginationParams } from '@/@types/api'
import type { MovementType } from '@features/movements'

// At weighted average cost (S5.6): averageCost = totalValue / quantity,
// weighted across the product's locations
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
    type: MovementType
    locationId: number | null
    sourceLocationId: number | null
    referenceType: string | null
    referenceId: number | null
    reason: string | null
    date: string | null
    createdAt: string | null
    // Per base unit: an OUT leaves at its location's average cost (S5.6)
    unitCost: number
}

export interface MovementHistoryParams extends PaginationParams {
    productId?: number
    type?: MovementType
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

// Valued kardex of a product (S5.6): closing = opening + totalIn - totalOut,
// in quantity and in value. Quantities in base units
export interface KardexBalance {
    quantity: number
    value: number
    // value / quantity; null without stock
    averageCost: number | null
}

export interface KardexTotal {
    quantity: number
    value: number
}

export interface KardexEntry {
    movementId: number
    date: string | null
    type: MovementType
    locationId: number | null
    locationName: string | null
    referenceType: string | null
    referenceId: number | null
    reason: string | null
    inQuantity: number
    outQuantity: number
    unitCost: number
    value: number
    balanceQuantity: number
    balanceValue: number
    averageCost: number | null
}

export interface Kardex {
    productId: number
    productName: string
    sku: string
    warehouseId: number | null
    fromDate: string
    toDate: string
    opening: KardexBalance
    entries: KardexEntry[]
    totalIn: KardexTotal
    totalOut: KardexTotal
    closing: KardexBalance
}

export interface KardexParams {
    productId: number
    warehouseId?: number
    // Default: the first day of the month to today
    fromDate?: string
    toDate?: string
}

// The documents that move stock (movement referenceType)
export const REFERENCE_TYPE_LABELS: Record<string, string> = {
    sale: 'Venta',
    refund: 'Devolución',
    purchase_order: 'Orden de compra',
    adjustment: 'Ajuste',
    transfer: 'Transferencia',
}

// Home page summary (GET /dashboard)
export interface Dashboard {
    inventoryValue: number
    warehouses: WarehouseSummary[]
    alerts: {
        lowStock: number
        outOfStock: number
        reorderPoint: number
        expiringSoon: number
    }
    // CONFIRMED sales: the SRI hasn't authorized their invoice yet
    uninvoicedSales: number
}
