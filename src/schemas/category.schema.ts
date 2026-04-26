import { z } from 'zod'

export const categorySchema = z.object({
    name: z
        .string()
        .min(1, 'Nombre requerido')
        .max(200, 'Máximo 200 caracteres'),
    description: z.string().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
