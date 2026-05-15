import { z } from 'zod'
import { optionalEmail } from '@shared/lib/schemas/common'

export const contactSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    role: z.string().optional(),
    email: optionalEmail,
    phone: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
