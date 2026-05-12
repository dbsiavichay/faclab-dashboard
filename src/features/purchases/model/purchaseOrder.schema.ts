import { z } from 'zod'

export const purchaseOrderSchema = z.object({
    supplierId: z
        .number({ error: 'Selecciona un proveedor' })
        .int()
        .positive('Selecciona un proveedor'),
    notes: z.string().optional(),
    expectedDate: z.string().optional(),
})

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>
