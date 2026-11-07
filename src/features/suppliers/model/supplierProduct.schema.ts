import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'

export const supplierProductSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    purchasePrice: z.number().min(0),
    supplierSku: z.string().optional(),
    minOrderQuantity: quantitySchema().optional(),
    leadTimeDays: z.number().int().min(0).optional(),
    isPreferred: z.boolean().optional(),
})

export type SupplierProductFormValues = z.infer<typeof supplierProductSchema>
