import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'

export const priceListSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, 'Nombre requerido')
            .max(64, 'Máximo 64 caracteres'),
        description: z.string().trim().max(255, 'Máximo 255 caracteres'),
        isActive: z.boolean(),
        // `YYYY-MM-DD` del input de fecha; vacío: sin límite
        validFrom: z.string(),
        validTo: z.string(),
    })
    .refine((v) => !v.validFrom || !v.validTo || v.validFrom <= v.validTo, {
        message: 'Termina antes de empezar',
        path: ['validTo'],
    })

export type PriceListFormValues = z.infer<typeof priceListSchema>

const price = z
    .number({ error: 'Ingrese un precio' })
    .min(0, 'No puede ser negativo')

// Desde qué cantidad rige, en su presentación: 0 es el precio base de la lista
const minQuantity = quantitySchema({ allowZero: true })

export const priceListItemCreateSchema = z.object({
    productId: z
        .number({ error: 'Debe seleccionar un producto' })
        .int()
        .min(1, 'Debe seleccionar un producto'),
    // La caja o el rollo que se cotiza; ninguna: la unidad base
    presentationId: z.number().int().nullable(),
    price,
    minQuantity,
})

export const priceListItemUpdateSchema = z.object({ price, minQuantity })

export type PriceListItemCreateFormValues = z.infer<
    typeof priceListItemCreateSchema
>
export type PriceListItemUpdateFormValues = z.infer<
    typeof priceListItemUpdateSchema
>
