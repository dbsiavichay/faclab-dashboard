import * as Yup from 'yup'
import { ALL_ROLES } from '@/constants/roles.constant'

export const createUserSchema = Yup.object({
    username: Yup.string()
        .min(1, 'Requerido')
        .max(64, 'Máximo 64 caracteres')
        .required('Ingresa el nombre de usuario'),
    email: Yup.string()
        .email('Email inválido')
        .max(128, 'Máximo 128 caracteres')
        .required('Ingresa el email'),
    password: Yup.string()
        .min(8, 'Mínimo 8 caracteres')
        .max(128, 'Máximo 128 caracteres')
        .required('Ingresa una contraseña'),
    role: Yup.number()
        .oneOf(ALL_ROLES as unknown as number[])
        .required('Selecciona un rol'),
})
