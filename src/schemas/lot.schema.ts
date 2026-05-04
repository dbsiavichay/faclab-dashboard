import { z } from 'zod'

export const lotCreateSchema = z.object({
    lotNumber: z.string().min(1, 'Número de lote requerido'),
    productId: z.number().int().min(1),
    initialQuantity: z.number().int().min(1),
    manufactureDate: z.string().optional(),
    expirationDate: z.string().optional(),
    notes: z.string().optional(),
})

export const lotUpdateSchema = z.object({
    currentQuantity: z.number().int().min(0),
    manufactureDate: z.string().optional(),
    expirationDate: z.string().optional(),
    notes: z.string().optional(),
})

export type LotCreateFormValues = z.infer<typeof lotCreateSchema>
export type LotUpdateFormValues = z.infer<typeof lotUpdateSchema>
