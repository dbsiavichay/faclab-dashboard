import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

export interface Lot {
    id: number
    lotNumber: string
    productId: number
    initialQuantity: number
    currentQuantity: number
    manufactureDate?: string | null
    expirationDate?: string | null
    isExpired: boolean
    daysToExpiry?: number | null
    notes?: string | null
    createdAt: string
    updatedAt: string
}

export interface LotInput {
    lotNumber: string
    productId: number
    initialQuantity: number
    manufactureDate?: string
    expirationDate?: string
    notes?: string
}

export interface LotQueryParams {
    productId?: number
    expiringInDays?: number
}

class LotService {
    private config = {
        host: appConfig.inventoryApiHost || 'http://localhost:3000',
    }

    async getLots(params?: LotQueryParams) {
        const queryParams = new URLSearchParams()

        if (params?.productId) {
            queryParams.append('productId', params.productId.toString())
        }
        if (params?.expiringInDays !== undefined) {
            queryParams.append(
                'expiringInDays',
                params.expiringInDays.toString()
            )
        }

        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.config.host}/lots?${queryString}`
            : `${this.config.host}/lots`

        return ApiService.fetchData<Lot[]>({
            url,
            method: 'get',
        })
    }

    async getLot(id: number) {
        return ApiService.fetchData<Lot>({
            url: `${this.config.host}/lots/${id}`,
            method: 'get',
        })
    }

    async createLot(lot: LotInput) {
        return ApiService.fetchData<Lot>({
            url: `${this.config.host}/lots`,
            method: 'post',
            data: lot,
        })
    }

    async updateLot(id: number, lot: LotInput) {
        return ApiService.fetchData<Lot>({
            url: `${this.config.host}/lots/${id}`,
            method: 'put',
            data: lot,
        })
    }

    async deleteLot(id: number) {
        return ApiService.fetchData<void>({
            url: `${this.config.host}/lots/${id}`,
            method: 'delete',
        })
    }
}

export default new LotService()
