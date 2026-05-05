import { z } from 'zod'

export const serialStatusChangeSchema = z.object({
    status: z.string().min(1, 'Debe seleccionar un estado'),
})

export type SerialStatusChangeFormValues = z.infer<
    typeof serialStatusChangeSchema
>
