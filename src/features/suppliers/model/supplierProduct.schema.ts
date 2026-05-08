import { z } from 'zod'

export const supplierProductSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    purchasePrice: z.number().min(0),
    supplierSku: z.string().optional(),
    minOrderQuantity: z.number().int().min(1).optional(),
    leadTimeDays: z.number().int().min(0).optional(),
    isPreferred: z.boolean().optional(),
})

export type SupplierProductFormValues = z.infer<typeof supplierProductSchema>
