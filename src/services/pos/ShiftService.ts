import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
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

const HOST = appConfig.posApiHost || 'http://localhost:3000/api/pos'

export const getActiveShift = () =>
    httpClient.get<DataResponse<Shift | null>>(`${HOST}/shifts/active`)

export const openShift = (data: OpenShiftInput) =>
    httpClient.post<DataResponse<Shift>>(`${HOST}/shifts/open`, data)

export const closeShift = (shiftId: number, data: CloseShiftInput) =>
    httpClient.post<DataResponse<Shift>>(
        `${HOST}/shifts/${shiftId}/close`,
        data
    )

export const getShift = (id: number) =>
    httpClient.get<DataResponse<Shift>>(`${HOST}/shifts/${id}`)

export const getShifts = (params?: PaginationParams) =>
    httpClient.get<PaginatedResponse<Shift>>(`${HOST}/shifts`, { params })

export const addCashMovement = (shiftId: number, data: CashMovementInput) =>
    httpClient.post<DataResponse<CashMovement>>(
        `${HOST}/shifts/${shiftId}/cash-movements`,
        data
    )

export const getCashMovements = (shiftId: number) =>
    httpClient.get<ListResponse<CashMovement>>(
        `${HOST}/shifts/${shiftId}/cash-movements`
    )
