import { z } from 'zod'

z.config({
    customError: (issue) => {
        switch (issue.code) {
            case 'invalid_type':
                if (
                    issue.input === undefined ||
                    issue.input === null ||
                    (typeof issue.input === 'number' && isNaN(issue.input))
                ) {
                    return 'Campo requerido'
                }
                if (issue.expected === 'number') {
                    return 'Debe ser un número'
                }
                return 'Tipo inválido'
            case 'too_small':
                if (issue.origin === 'string') {
                    if (issue.minimum === 1) {
                        return 'Campo requerido'
                    }
                    return `Mínimo ${issue.minimum} caracteres`
                }
                if (issue.origin === 'number') {
                    return `Debe ser mayor o igual a ${issue.minimum}`
                }
                break
            case 'too_big':
                if (issue.origin === 'string') {
                    return `Máximo ${issue.maximum} caracteres`
                }
                if (issue.origin === 'number') {
                    return `Debe ser menor o igual a ${issue.maximum}`
                }
                break
            case 'invalid_format':
                if (issue.format === 'email') {
                    return 'Correo electrónico inválido'
                }
                break
            case 'invalid_value':
                return 'Valor no permitido'
        }
        return undefined
    },
})
