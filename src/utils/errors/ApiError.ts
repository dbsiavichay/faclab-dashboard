import type { AxiosError } from 'axios'
import type { ApiErrorItem, ApiErrorResponse } from '@/@types/auth'

export class ApiError extends Error {
    code: string
    field: string | null
    status: number
    errors: ApiErrorItem[]
    requestId?: string

    constructor(params: {
        code: string
        message: string
        field?: string | null
        status: number
        errors?: ApiErrorItem[]
        requestId?: string
    }) {
        super(params.message)
        this.name = 'ApiError'
        this.code = params.code
        this.field = params.field ?? null
        this.status = params.status
        this.errors = params.errors ?? [
            {
                code: params.code,
                message: params.message,
                field: params.field ?? null,
            },
        ]
        this.requestId = params.requestId
    }
}

export const isApiError = (value: unknown): value is ApiError =>
    value instanceof ApiError

const isErrorResponse = (data: unknown): data is ApiErrorResponse =>
    !!data &&
    typeof data === 'object' &&
    Array.isArray((data as ApiErrorResponse).errors) &&
    (data as ApiErrorResponse).errors.length > 0

export const fromAxiosError = (err: AxiosError): ApiError => {
    const status = err.response?.status ?? 0
    const body = err.response?.data as ApiErrorResponse | undefined

    if (isErrorResponse(body)) {
        const [first] = body.errors
        return new ApiError({
            code: first.code,
            message: first.message,
            field: first.field ?? null,
            status,
            errors: body.errors,
            requestId: body.meta?.requestId,
        })
    }

    return new ApiError({
        code: err.code ?? 'NETWORK_ERROR',
        message: err.message || 'Request failed',
        status,
    })
}
