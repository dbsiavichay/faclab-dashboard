import { z } from 'zod'

const optionalEmail = z
    .union([z.email('Email inválido'), z.literal('')])
    .optional()

export const customerSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    taxId: z.string().min(1, 'Identificación requerida'),
    taxType: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)], {
        error: 'Tipo de identificación requerido',
    }),
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
