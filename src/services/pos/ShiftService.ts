import ApiService from '@/services/ApiService'
import appConfig from '@/configs/app.config'
import type {
    DataResponse,
    PaginatedResponse,
    PaginationParams,
} from '@/@types/api'
import type {
    Shift,
    OpenShiftInput,
    CloseShiftInput,
    CashMovement,
    CashMovementInput,
    ListResponse,
} from './POSTypes'

class ShiftService {
    private host = appConfig.posApiHost || 'http://localhost:3000/api/pos'

    async getActiveShift() {
        return ApiService.fetchData<DataResponse<Shift | null>>({
            url: `${this.host}/shifts/active`,
            method: 'get',
        })
    }

    async openShift(data: OpenShiftInput) {
        return ApiService.fetchData<DataResponse<Shift>>({
            url: `${this.host}/shifts/open`,
            method: 'post',
            data,
        })
    }

    async closeShift(shiftId: number, data: CloseShiftInput) {
        return ApiService.fetchData<DataResponse<Shift>>({
            url: `${this.host}/shifts/${shiftId}/close`,
            method: 'post',
            data,
        })
    }

    async getShift(id: number) {
        return ApiService.fetchData<DataResponse<Shift>>({
            url: `${this.host}/shifts/${id}`,
            method: 'get',
        })
    }

    async getShifts(params?: PaginationParams) {
        const queryParams = new URLSearchParams()
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString())
        }
        if (params?.offset !== undefined) {
            queryParams.append('offset', params.offset.toString())
        }
        const queryString = queryParams.toString()
        const url = queryString
            ? `${this.host}/shifts?${queryString}`
            : `${this.host}/shifts`
        return ApiService.fetchData<PaginatedResponse<Shift>>({
            url,
            method: 'get',
        })
    }

    async addCashMovement(shiftId: number, data: CashMovementInput) {
        return ApiService.fetchData<DataResponse<CashMovement>>({
            url: `${this.host}/shifts/${shiftId}/cash-movements`,
            method: 'post',
            data,
        })
    }

    async getCashMovements(shiftId: number) {
        return ApiService.fetchData<ListResponse<CashMovement>>({
            url: `${this.host}/shifts/${shiftId}/cash-movements`,
            method: 'get',
        })
    }
}

export default new ShiftService()
