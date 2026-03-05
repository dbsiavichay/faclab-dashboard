import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type { PaginatedResponse, DataResponse } from '@/@types/api'

export type MovementType = 'in' | 'out'

export interface Movement {
    id: number
    productId: number
    quantity: number
    type: MovementType
    reason?: string | null
    date?: string | null
}

export interface MovementInput {
    productId: number
    quantity: number
    type: MovementType
    reason?: string
    date?: string
}

export interface MovementQueryParams {
    productId?: number
    type?: MovementType
    fromDate?: string
    toDate?: string
    limit?: number
    offset?: number
}

class MovementService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

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

        return ApiService.fetchData<PaginatedResponse<Movement>>({
            url,
            method: 'get',
        })
    }

    async createMovement(movement: MovementInput) {
        const validation = this.validateMovement(movement)
        if (!validation.valid) {
            throw new Error(validation.error)
        }

        return ApiService.fetchData<DataResponse<Movement>>({
            url: `${this.config.host}/movements`,
            method: 'post',
            data: movement,
        })
    }
}

export default new MovementService()
