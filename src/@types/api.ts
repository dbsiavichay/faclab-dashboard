export interface PaginationMeta {
    total: number
    limit: number
    offset: number
}

export interface Meta {
    requestId: string
    timestamp: string
}

export interface PaginatedMeta extends Meta {
    pagination: PaginationMeta
}

export interface DataResponse<T> {
    data: T
    meta: Meta
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginatedMeta
}

export interface ErrorDetail {
    code: string
    message: string
    field?: string
}

export interface ErrorResponse {
    errors: ErrorDetail[]
    meta: Meta
}

export interface PaginationParams {
    limit?: number
    offset?: number
}
