import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'

const DAY = /^\d{4}-\d{2}-\d{2}$/

/** Un día `YYYY-MM-DD` desde `today` (el último en que rige la cotización) */
const validUntilSchema = (today: string) =>
    z
        .string()
        .regex(DAY, 'Indica la fecha de validez')
        .refine((value) => value >= today, 'Debe ser hoy o una fecha posterior')

export const quoteCreateSchema = (today: string) =>
    z.object({
        // Null: consumidor final
        customerId: z.number().int().positive().nullable(),
        validUntil: validUntilSchema(today),
        notes: z.string().max(1024, 'Máximo 1024 caracteres').optional(),
    })

/** Editar un borrador: los mismos datos (la sucursal no cambia) */
export const quoteUpdateSchema = quoteCreateSchema

export const quoteItemCreateSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    // The box or roll it is quoted in (S5.2); none: the base unit
    presentationId: z.number().int().optional().nullable(),
    quantity: quantitySchema(),
    discount: z.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
})

export const quoteItemUpdateSchema = quoteItemCreateSchema.pick({
    quantity: true,
    discount: true,
})

export const renewQuoteSchema = (today: string) =>
    z.object({ validUntil: validUntilSchema(today) })

export const emailQuoteSchema = z.object({
    to: z.email('Correo inválido'),
})

export type QuoteCreateFormValues = z.infer<
    ReturnType<typeof quoteCreateSchema>
>
export type QuoteUpdateFormValues = QuoteCreateFormValues
export type QuoteItemCreateFormValues = z.infer<typeof quoteItemCreateSchema>
export type QuoteItemUpdateFormValues = z.infer<typeof quoteItemUpdateSchema>
export type RenewQuoteFormValues = z.infer<ReturnType<typeof renewQuoteSchema>>
export type EmailQuoteFormValues = z.infer<typeof emailQuoteSchema>
