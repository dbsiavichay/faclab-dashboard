import { z } from 'zod'

export const locationSchema = z.object({
    warehouseId: z
        .number({ error: 'Debe seleccionar una bodega' })
        .int()
        .min(1, 'Debe seleccionar una bodega'),
    name: z.string().min(1, 'Nombre requerido'),
    code: z.string().min(1, 'Código requerido'),
    type: z.enum(['STORAGE', 'RECEIVING', 'SHIPPING', 'RETURN']),
    isActive: z.boolean().optional(),
    capacity: z.number().int().min(0).nullable().optional(),
})

export type LocationFormValues = z.infer<typeof locationSchema>
