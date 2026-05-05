import { z } from 'zod'

export const certificateUploadSchema = z.object({
    file: z.instanceof(File, { error: 'Selecciona un archivo .p12' }),
    password: z.string().min(1, 'Contraseña requerida'),
})

export type CertificateUploadFormValues = z.infer<
    typeof certificateUploadSchema
>
