import { z } from 'zod'

export const movementSchema = z.object({
    productId: z.number().int().min(1),
    quantity: z
        .number()
        .int()
        .refine((v) => v !== 0, 'No puede ser cero'),
    type: z.enum(['in', 'out']),
    reason: z.string().optional(),
    date: z.string().optional(),
})

export type MovementFormValues = z.infer<typeof movementSchema>
