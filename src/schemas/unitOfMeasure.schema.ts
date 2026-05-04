import { z } from 'zod'

export const unitOfMeasureSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    symbol: z.string().min(1, 'Símbolo requerido'),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
})

export type UnitOfMeasureFormValues = z.infer<typeof unitOfMeasureSchema>
