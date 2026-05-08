import { httpClient } from '@shared/lib/http/httpClient'
import appConfig from '@/configs/app.config'
import type {
    PaginatedResponse,
    DataResponse,
    PaginationParams,
} from '@/@types/api'

const HOST = appConfig.inventoryApiHost || 'http://localhost:3000/api/admin'

export interface Category {
    id: number
    name: string
    description?: string | null
}

export interface CategoryInput {
    name: string
    description?: string
    [key: string]: unknown
}

export const getCategories = (params?: PaginationParams) =>
    httpClient.get<PaginatedResponse<Category>>(`${HOST}/categories`, {
        params,
    })

export const getCategoryById = (id: number) =>
    httpClient.get<DataResponse<Category>>(`${HOST}/categories/${id}`)

export const createCategory = (category: CategoryInput) =>
    httpClient.post<DataResponse<Category>>(`${HOST}/categories`, category)

export const updateCategory = (id: number, category: Partial<CategoryInput>) =>
    httpClient.put<DataResponse<Category>>(`${HOST}/categories/${id}`, category)

export const deleteCategory = (id: number) =>
    httpClient.delete(`${HOST}/categories/${id}`)
