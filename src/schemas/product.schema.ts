import * as Yup from 'yup'

export const productSchema = Yup.object({
    name: Yup.string()
        .required('Nombre requerido')
        .max(200, 'Máximo 200 caracteres'),
    sku: Yup.string()
        .required('SKU requerido')
        .max(100, 'Máximo 100 caracteres'),
    description: Yup.string().optional().nullable(),
    barcode: Yup.string().optional().nullable(),
    categoryId: Yup.number().optional().nullable(),
    unitOfMeasureId: Yup.number().optional().nullable(),
    purchasePrice: Yup.number()
        .optional()
        .nullable()
        .min(0, 'Debe ser mayor o igual a 0'),
    salePrice: Yup.number()
        .optional()
        .nullable()
        .min(0, 'Debe ser mayor o igual a 0'),
    isActive: Yup.boolean().optional(),
    isService: Yup.boolean().optional(),
    minStock: Yup.number()
        .optional()
        .integer('Debe ser entero')
        .min(0, 'Debe ser mayor o igual a 0'),
    maxStock: Yup.number()
        .optional()
        .nullable()
        .integer('Debe ser entero')
        .min(0, 'Debe ser mayor o igual a 0'),
    reorderPoint: Yup.number()
        .optional()
        .integer('Debe ser entero')
        .min(0, 'Debe ser mayor o igual a 0'),
    leadTimeDays: Yup.number()
        .optional()
        .nullable()
        .integer('Debe ser entero')
        .min(0, 'Debe ser mayor o igual a 0'),
})
