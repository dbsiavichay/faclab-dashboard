import { z } from 'zod'

export const signInSchema = z.object({
    username: z
        .string()
        .min(1, 'Ingresa tu usuario')
        .max(64, 'El usuario es demasiado largo'),
    password: z
        .string()
        .min(1, 'Ingresa tu contraseña')
        .max(128, 'La contraseña es demasiado larga'),
})

export type SignInFormValues = z.infer<typeof signInSchema>

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
        newPassword: z
            .string()
            .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
            .max(128, 'La contraseña es demasiado larga'),
        confirmNewPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
    })
    .refine((data) => data.confirmNewPassword === data.newPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmNewPassword'],
    })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
