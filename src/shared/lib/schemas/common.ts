import { z } from 'zod'
import { fitsDecimals } from '../quantity'

// What core keeps of a cost: numeric(18, 6)
export const MAX_COST_DECIMALS = 6

// A unit cost per base unit (S5.6): an IN of stock enters at it
export const unitCostSchema = z
    .number()
    .min(0, 'No puede ser negativo')
    .refine((v) => fitsDecimals(v, MAX_COST_DECIMALS), {
        message: `Máximo ${MAX_COST_DECIMALS} decimales`,
    })

export const optionalEmail = z
    .union([z.email('Email inválido'), z.literal('')])
    .optional()

export const taxTypeSchema = z.union(
    [z.literal(1), z.literal(2), z.literal(3), z.literal(4)],
    { error: 'Tipo de identificación requerido' }
)
