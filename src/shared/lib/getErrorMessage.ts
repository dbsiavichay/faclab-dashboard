import axios from 'axios'
import { isApiError } from '@/utils/errors/ApiError'

/** Textos propios por código de error, para lo que el backend dice en inglés */
export type ErrorMessages = Partial<Record<string, string>>

/** Errores que puede dar cualquier pantalla, con su texto por defecto */
const COMMON_ERROR_MESSAGES: ErrorMessages = {
    // S5.1: cada unidad de medida dice cuántos decimales admite (0 = enteras)
    QUANTITY_PRECISION_EXCEEDED:
        'La cantidad tiene más decimales de los que admite la unidad del producto.',
}

export function getErrorMessage(
    error: unknown,
    fallback: string,
    messages?: ErrorMessages
): string {
    // httpClient rechaza siempre con ApiError (primer error del envelope)
    if (isApiError(error)) {
        return (
            messages?.[error.code] ||
            COMMON_ERROR_MESSAGES[error.code] ||
            error.message ||
            fallback
        )
    }
    if (axios.isAxiosError(error)) {
        const data = error.response?.data
        if (data?.errors?.length > 0) {
            return data.errors[0].message || fallback
        }
        return data?.detail || data?.message || error.message || fallback
    }
    if (error instanceof Error) {
        return error.message || fallback
    }
    return fallback
}
