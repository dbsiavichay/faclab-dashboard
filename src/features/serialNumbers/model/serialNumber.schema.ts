import { z } from 'zod'

export const serialNumberSchema = z.object({
    serialNumber: z.string().min(1, 'Número de serie requerido'),
    productId: z.number().int().min(1),
    lotId: z.number().int().min(1).optional(),
    notes: z.string().optional(),
})

export type SerialNumberFormValues = z.infer<typeof serialNumberSchema>
