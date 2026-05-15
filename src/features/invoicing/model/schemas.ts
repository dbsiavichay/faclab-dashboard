import { z } from 'zod'

export const companyConfigSchema = z.object({
    taxId: z.string().min(1, 'RUC requerido').max(13),
    name: z.string().min(1, 'Razón social requerida').max(300),
    tradeName: z.string().min(1, 'Nombre comercial requerido').max(300),
    mainAddress: z.string().min(1).max(300),
    branchAddress: z.string().min(1).max(300),
    branchCode: z.string().min(1).max(4),
    salePointCode: z.string().min(1).max(4),
    environment: z.union([z.literal(1), z.literal(2)]),
    emissionType: z.literal(1),
    invoiceSequence: z.number().int().positive().optional(),
    signingCertId: z.string().optional().nullable(),
    accountingRequired: z.boolean().optional(),
    specialTaxpayerResolution: z.string().optional(),
    withholdingAgentResolution: z.string().optional(),
})

export type CompanyConfigFormValues = z.infer<typeof companyConfigSchema>

export const certificateUploadSchema = z.object({
    file: z.instanceof(File, { error: 'Selecciona un archivo .p12' }),
    password: z.string().min(1, 'Contraseña requerida'),
})

export type CertificateUploadFormValues = z.infer<
    typeof certificateUploadSchema
>
