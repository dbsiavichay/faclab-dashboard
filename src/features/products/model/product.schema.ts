import { z } from 'zod'
import { quantitySchema } from '@shared/lib/quantity'
import {
    CONSTRUCTION_MATERIAL_CODES,
    CONSTRUCTION_MATERIAL_TAX_CODE,
    TAX_CODE_LABELS,
    TAX_CODES,
} from '@/constants/tax.constant'

export const productSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Nombre requerido')
            .max(200, 'Máximo 200 caracteres'),
        sku: z
            .string()
            .min(1, 'SKU requerido')
            .max(100, 'Máximo 100 caracteres'),
        description: z.string().optional().nullable(),
        barcode: z.string().optional().nullable(),
        categoryId: z.number().optional().nullable(),
        // The base unit, the one stock is kept in: required since S5.2
        unitOfMeasureId: z.number({ error: 'Seleccione la unidad de medida' }),
        purchasePrice: z
            .number()
            .min(0, 'Debe ser mayor o igual a 0')
            .optional()
            .nullable(),
        salePrice: z
            .number()
            .min(0, 'Debe ser mayor o igual a 0')
            .optional()
            .nullable(),
        taxCode: z.enum(TAX_CODES),
        constructionMaterialCode: z
            .enum(CONSTRUCTION_MATERIAL_CODES)
            .optional()
            .nullable(),
        isActive: z.boolean().optional(),
        isService: z.boolean().optional(),
        // Stock thresholds: decimal like any quantity (S5.1)
        minStock: quantitySchema({ allowZero: true }).optional(),
        maxStock: quantitySchema({ allowZero: true }).optional().nullable(),
        reorderPoint: quantitySchema({ allowZero: true }).optional(),
        leadTimeDays: z
            .number()
            .int('Debe ser entero')
            .min(0, 'Debe ser mayor o igual a 0')
            .optional()
            .nullable(),
    })
    .superRefine((values, ctx) => {
        if (
            values.constructionMaterialCode &&
            values.taxCode !== CONSTRUCTION_MATERIAL_TAX_CODE
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['taxCode'],
                message: `Un material de construcción lleva ${TAX_CODE_LABELS[CONSTRUCTION_MATERIAL_TAX_CODE]}`,
            })
        }
    })

export type ProductFormValues = z.infer<typeof productSchema>
