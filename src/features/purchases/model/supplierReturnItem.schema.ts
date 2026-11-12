import { z } from 'zod'
import {
    formatQuantity,
    quantitySchema,
    roundQuantity,
} from '@shared/lib/quantity'
import type { PurchaseOrderItem, SupplierReturnItem } from './types'

/** What an order line can still give back in a draft: received, minus
 *  returned, minus what the draft's other lines take of it */
export const returnableOf = (
    orderItem: PurchaseOrderItem,
    lines: SupplierReturnItem[],
    exceptLine?: number
): number =>
    roundQuantity(
        orderItem.quantityReceived -
            (orderItem.quantityReturned ?? 0) -
            lines
                .filter(
                    (l) =>
                        l.purchaseOrderItemId === orderItem.id &&
                        l.id !== exceptLine
                )
                .reduce((sum, l) => sum + l.quantity, 0)
    )

/**
 * A line of a supplier return (S5.7): at most what its order line can still
 * give back, `returnable[purchaseOrderItemId]` (received minus returned, minus
 * what the draft's other lines take). Core checks it again when confirming.
 */
export const supplierReturnItemSchema = (returnable: Record<number, number>) =>
    z
        .object({
            purchaseOrderItemId: z
                .number({ error: 'Seleccione una línea de la orden' })
                .min(1, 'Seleccione una línea de la orden'),
            quantity: quantitySchema(),
            locationId: z.number().nullable(),
        })
        .superRefine((values, ctx) => {
            const max = returnable[values.purchaseOrderItemId]
            if (max !== undefined && values.quantity > max + 1e-9) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['quantity'],
                    message: `Máximo ${formatQuantity(max)}`,
                })
            }
        })

export type SupplierReturnItemFormValues = z.infer<
    ReturnType<typeof supplierReturnItemSchema>
>
