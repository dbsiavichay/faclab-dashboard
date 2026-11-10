import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'

/**
 * Una presentación del producto (S5.2): caja de 100, rollo de 50 m. El factor
 * dice cuántas unidades base trae y no puede ser cero ni negativo; sin precio
 * propio se vende a factor × el precio del producto.
 */
export const productPresentationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Nombre requerido')
        .max(64, 'Máximo 64 caracteres'),
    factor: quantitySchema({ message: 'Ingrese cuántas unidades trae' }),
    barcode: z.string().max(64, 'Máximo 64 caracteres').optional().nullable(),
    salePrice: z
        .number()
        .min(0, 'Debe ser mayor o igual a 0')
        .optional()
        .nullable(),
    purchasePrice: z
        .number()
        .min(0, 'Debe ser mayor o igual a 0')
        .optional()
        .nullable(),
    isActive: z.boolean(),
})

export type ProductPresentationFormValues = z.infer<
    typeof productPresentationSchema
>
