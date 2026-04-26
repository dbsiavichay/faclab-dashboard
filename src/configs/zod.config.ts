import { z } from 'zod'

const errorMap: z.ZodErrorMap = (issue, ctx) => {
    switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
            if (
                issue.received === 'undefined' ||
                issue.received === 'null' ||
                issue.received === 'nan'
            ) {
                return { message: 'Campo requerido' }
            }
            if (issue.expected === 'number') {
                return { message: 'Debe ser un número' }
            }
            return { message: 'Tipo inválido' }
        case z.ZodIssueCode.too_small:
            if (issue.type === 'string') {
                if (issue.minimum === 1) {
                    return { message: 'Campo requerido' }
                }
                return { message: `Mínimo ${issue.minimum} caracteres` }
            }
            if (issue.type === 'number') {
                return {
                    message: `Debe ser mayor o igual a ${issue.minimum}`,
                }
            }
            break
        case z.ZodIssueCode.too_big:
            if (issue.type === 'string') {
                return { message: `Máximo ${issue.maximum} caracteres` }
            }
            if (issue.type === 'number') {
                return {
                    message: `Debe ser menor o igual a ${issue.maximum}`,
                }
            }
            break
        case z.ZodIssueCode.invalid_string:
            if (issue.validation === 'email') {
                return { message: 'Correo electrónico inválido' }
            }
            break
        case z.ZodIssueCode.invalid_enum_value:
            return { message: 'Valor no permitido' }
    }
    return { message: ctx.defaultError }
}

z.setErrorMap(errorMap)
