import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'

export const transferItemCreateSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    quantity: quantitySchema(),
    lotId: z.number().int().positive().nullable().optional(),
    notes: z.string().optional(),
})

export const transferItemUpdateSchema = z.object({
    quantity: quantitySchema(),
    notes: z.string().optional(),
})

export type TransferItemCreateFormValues = z.infer<
    typeof transferItemCreateSchema
>
export type TransferItemUpdateFormValues = z.infer<
    typeof transferItemUpdateSchema
>
