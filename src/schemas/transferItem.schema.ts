import { z } from 'zod'

export const transferItemCreateSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    quantity: z.number().int().min(1),
    lotId: z.number().int().positive().nullable().optional(),
    notes: z.string().optional(),
})

export const transferItemUpdateSchema = z.object({
    quantity: z.number().int().min(1),
    notes: z.string().optional(),
})

export type TransferItemCreateFormValues = z.infer<
    typeof transferItemCreateSchema
>
export type TransferItemUpdateFormValues = z.infer<
    typeof transferItemUpdateSchema
>
