import { z } from 'zod'
import { MAX_QUANTITY_DECIMALS } from '@shared/lib/quantity'

export const unitOfMeasureSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    symbol: z.string().min(1, 'Símbolo requerido'),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    decimals: z
        .number({ error: 'Ingrese los decimales' })
        .int('Debe ser entero')
        .min(0, 'Mínimo 0')
        .max(MAX_QUANTITY_DECIMALS, `Máximo ${MAX_QUANTITY_DECIMALS}`),
})

export type UnitOfMeasureFormValues = z.infer<typeof unitOfMeasureSchema>
