import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

export type MovementType = 'in' | 'out'

export interface Movement {
    id: number
    productId: number
    quantity: number
    type: MovementType
    reason?: string | null
    date?: string | null // ISO 8601 datetime
}

export interface MovementInput {
    productId: number
    quantity: number
    type: MovementType
    reason?: string
    date?: string // ISO 8601 datetime
}

export interface MovementQueryParams {
    productId?: number
    type?: MovementType
    fromDate?: string // ISO 8601 datetime
    toDate?: string // ISO 8601 datetime
    limit?: number // default: 100, range: 1-1000
    offset?: number // default: 0
}

class MovementService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    /**
     * Validates a movement before sending to API
     * - If type is "in", quantity must be positive
     * - If type is "out", quantity must be negative
     * - Quantity cannot be zero
     */
    validateMovement(movement: MovementInput): {
        valid: boolean
        error?: string
    } {
        if (movement.quantity === 0) {
            return { valid: false, error: 'La cantidad no puede ser cero' }
        }

        if (movement.type === 'in' && movement.quantity < 0) {
            return {
                valid: false,
                error: 'La cantidad debe ser positiva para movimientos de entrada',
            }
        }

        if (movement.type === 'out' && movement.quantity > 0) {
            return {
                valid: false,
                error: 'La cantidad debe ser negativa para movimientos de salida',
            }
        }

        return { valid: true }
    }

    async getMovements(params?: MovementQueryParams) {
        const queryParams = new URLSearchParams()

        if (params?.productId) {
            queryParams.append('productId', params.productId.toString())
        }
        if (params?.type) {
            queryParams.append('type', params.type)
        }
        if (params?.fromDate) {
            queryParams.append('fromDate', params.fromDate)
        }
        if (params?.toDate) {
            queryParams.append('toDate', params.toDate)
        }
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }

        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/movements?${queryString}`
            : `${this.config.host}/movements`

        return ApiService.fetchData<Movement[]>({
            url,
            method: 'get',
        })
    }

    async createMovement(movement: MovementInput) {
        // Validate before sending
        const validation = this.validateMovement(movement)
        if (!validation.valid) {
            throw new Error(validation.error)
        }

        return ApiService.fetchData<Movement>({
            url: `${this.config.host}/movements`,
            method: 'post',
            data: movement,
        })
    }
}

export default new MovementService()
