import { z } from 'zod'
import { optionalEmail, taxTypeSchema } from '@shared/lib/schemas/common'

export const customerSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    taxId: z.string().min(1, 'Identificación requerida'),
    taxType: taxTypeSchema,
    email: optionalEmail,
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    creditLimit: z.number().min(0).optional(),
    paymentTerms: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
