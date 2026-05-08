import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export interface UnitOfMeasure {
    id: number
    name: string
    symbol: string
    description?: string | null
    isActive: boolean
}

export interface UnitOfMeasureInput {
    name: string
    symbol: string
    description?: string | null
    isActive?: boolean
    [key: string]: unknown
}

export interface UnitOfMeasureQueryParams extends PaginationParams {
    isActive?: boolean
}

export const getUnitsOfMeasure = (params?: UnitOfMeasureQueryParams) =>
    httpClient.get<PaginatedResponse<UnitOfMeasure>>(
        `${HOST}/units-of-measure`,
        { params }
    )

export const getUnitOfMeasureById = (id: number) =>
    httpClient.get<DataResponse<UnitOfMeasure>>(
        `${HOST}/units-of-measure/${id}`
    )

export const createUnitOfMeasure = (data: UnitOfMeasureInput) =>
    httpClient.post<DataResponse<UnitOfMeasure>>(
        `${HOST}/units-of-measure`,
        data
    )

export const updateUnitOfMeasure = (
    id: number,
    data: Partial<UnitOfMeasureInput>
) =>
    httpClient.put<DataResponse<UnitOfMeasure>>(
        `${HOST}/units-of-measure/${id}`,
        data
    )

export const deleteUnitOfMeasure = (id: number) =>
    httpClient.delete(`${HOST}/units-of-measure/${id}`)
