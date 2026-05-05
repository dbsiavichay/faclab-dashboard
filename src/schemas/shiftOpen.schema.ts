import { z } from 'zod'

export const shiftOpenSchema = z.object({
    cashierName: z.string().min(1, 'Nombre del cajero requerido'),
    openingBalance: z.number().min(0, 'El saldo inicial no puede ser negativo'),
    notes: z.string().optional(),
})

export type ShiftOpenFormValues = z.infer<typeof shiftOpenSchema>
