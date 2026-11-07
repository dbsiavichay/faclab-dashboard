import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'

export const purchaseOrderItemCreateSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    quantityOrdered: quantitySchema(),
    unitCost: z.number().min(0),
})

export const purchaseOrderItemUpdateSchema = z.object({
    quantityOrdered: quantitySchema(),
    unitCost: z.number().min(0),
})

export type PurchaseOrderItemCreateFormValues = z.infer<
    typeof purchaseOrderItemCreateSchema
>
export type PurchaseOrderItemUpdateFormValues = z.infer<
    typeof purchaseOrderItemUpdateSchema
>
