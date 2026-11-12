import { z } from 'zod'
import { MAX_QUANTITY_DECIMALS, fitsDecimals } from '@shared/lib/quantity'
import { unitCostSchema } from '@shared/lib/schemas/common'
import { MOVEMENT_TYPES } from './types'

export const movementSchema = z.object({
    productId: z.number().int().min(1),
    // Positive for an IN, negative for an OUT; decimal (S5.1)
    quantity: z
        .number()
        .refine((v) => v !== 0, 'No puede ser cero')
        .refine((v) => fitsDecimals(v, MAX_QUANTITY_DECIMALS), {
            message: `Máximo ${MAX_QUANTITY_DECIMALS} decimales`,
        }),
    type: z.enum(MOVEMENT_TYPES),
    reason: z.string().optional(),
    date: z.string().optional(),
    // Only an IN takes it (S5.6): an OUT leaves at the average cost
    unitCost: unitCostSchema.optional(),
})

export type MovementFormValues = z.infer<typeof movementSchema>
