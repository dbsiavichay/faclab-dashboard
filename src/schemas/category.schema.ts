import * as Yup from 'yup'

export const categorySchema = Yup.object({
    name: Yup.string()
        .required('Nombre requerido')
        .max(200, 'Máximo 200 caracteres'),
    description: Yup.string().optional(),
})
