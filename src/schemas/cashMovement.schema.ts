import { z } from 'zod'

export const cashMovementSchema = z.object({
    type: z.enum(['IN', 'OUT']),
    amount: z.number().positive('El monto debe ser mayor a cero'),
    reason: z.string().optional(),
})

export type CashMovementFormValues = z.infer<typeof cashMovementSchema>
