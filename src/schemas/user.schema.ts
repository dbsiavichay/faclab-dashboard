import { z } from 'zod'
import { ALL_ROLES, type RoleCode } from '@/constants/roles.constant'

export const createUserSchema = z.object({
    username: z
        .string()
        .min(1, 'Ingresa el nombre de usuario')
        .max(64, 'Máximo 64 caracteres'),
    email: z
        .string()
        .min(1, 'Ingresa el email')
        .email('Email inválido')
        .max(128, 'Máximo 128 caracteres'),
    password: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .max(128, 'Máximo 128 caracteres'),
    role: z
        .number({ required_error: 'Selecciona un rol' })
        .refine((v) => (ALL_ROLES as number[]).includes(v), {
            message: 'Selecciona un rol válido',
        }) as z.ZodType<RoleCode>,
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
