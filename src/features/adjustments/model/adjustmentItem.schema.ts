import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'
import { unitCostSchema } from '@shared/lib/schemas/common'

export const adjustmentItemCreateSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    locationId: z
        .number({ error: 'Debe seleccionar una ubicación' })
        .int()
        .min(1, 'Debe seleccionar una ubicación'),
    actualQuantity: quantitySchema({ allowZero: true }),
    lotId: z.number().int().positive().nullable().optional(),
    notes: z.string().optional(),
    // What the count adds enters at it (an initial balance, S5.6)
    unitCost: unitCostSchema.optional(),
})

export const adjustmentItemUpdateSchema = z.object({
    actualQuantity: quantitySchema({ allowZero: true }),
    notes: z.string().optional(),
    unitCost: unitCostSchema.optional(),
})

export type AdjustmentItemCreateFormValues = z.infer<
    typeof adjustmentItemCreateSchema
>
export type AdjustmentItemUpdateFormValues = z.infer<
    typeof adjustmentItemUpdateSchema
>
