import { z } from 'zod'
import { optionalEmail } from './common'

export const warehouseSchema = z.object({
    name: z.string().min(1, 'Nombre requerido').max(200),
    code: z.string().min(1, 'Código requerido').max(50),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    manager: z.string().optional(),
    phone: z.string().optional(),
    email: optionalEmail,
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
})

export type WarehouseFormValues = z.infer<typeof warehouseSchema>
