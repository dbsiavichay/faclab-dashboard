import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'

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
})

export const adjustmentItemUpdateSchema = z.object({
    actualQuantity: quantitySchema({ allowZero: true }),
    notes: z.string().optional(),
})

export type AdjustmentItemCreateFormValues = z.infer<
    typeof adjustmentItemCreateSchema
>
export type AdjustmentItemUpdateFormValues = z.infer<
    typeof adjustmentItemUpdateSchema
>
