import { z } from 'zod'
import { optionalEmail } from '@shared/lib/schemas/common'

export const taxTypeSchema = z.union(
    [z.literal(1), z.literal(2), z.literal(3), z.literal(4)],
    { error: 'Tipo de identificación requerido' }
)

export const supplierSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    taxId: z.string().min(1, 'Identificación requerida'),
    taxType: taxTypeSchema,
    email: optionalEmail,
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    paymentTerms: z.number().int().min(0).optional(),
    leadTimeDays: z.number().int().min(0).optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
