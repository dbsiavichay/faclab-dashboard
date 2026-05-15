import { z } from 'zod'

export const optionalEmail = z
    .union([z.email('Email inválido'), z.literal('')])
    .optional()

export const taxTypeSchema = z.union(
    [z.literal(1), z.literal(2), z.literal(3), z.literal(4)],
    { error: 'Tipo de identificación requerido' }
)
