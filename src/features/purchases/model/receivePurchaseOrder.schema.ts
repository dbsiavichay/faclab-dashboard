import { z } from 'zod'

export const receiveItemSchema = z
    .object({
        purchaseOrderItemId: z.number(),
        productId: z.number(),
        quantityOrdered: z.number(),
        quantityReceived: z.number(),
        quantityPending: z.number(),
        quantityToReceive: z.number().min(0, 'Mínimo 0'),
        locationId: z.number().nullable(),
        lotNumber: z.string(),
        serialNumbers: z.string(),
    })
    .refine((d) => d.quantityToReceive <= d.quantityPending, {
        message: 'Excede pendiente',
        path: ['quantityToReceive'],
    })

export const receiveFormSchema = z
    .object({
        items: z.array(receiveItemSchema),
        notes: z.string(),
        receivedAt: z.string(),
    })
    .refine((d) => d.items.some((i) => i.quantityToReceive > 0), {
        message: 'Debe recibir al menos un item',
        path: ['items'],
    })

export type ReceiveItemFormValues = z.infer<typeof receiveItemSchema>
export type ReceiveFormValues = z.infer<typeof receiveFormSchema>
