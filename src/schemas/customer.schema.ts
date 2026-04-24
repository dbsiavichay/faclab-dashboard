import * as Yup from 'yup'

export const customerSchema = Yup.object({
    name: Yup.string().required('Nombre requerido'),
    taxId: Yup.string().required('Identificación requerida'),
    taxType: Yup.number()
        .oneOf([1, 2, 3, 4])
        .required('Tipo de identificación requerido'),
    email: Yup.string().email('Email inválido').optional(),
    phone: Yup.string().optional(),
    address: Yup.string().optional(),
    city: Yup.string().optional(),
    state: Yup.string().optional(),
    country: Yup.string().optional(),
    creditLimit: Yup.number().optional().min(0),
    paymentTerms: Yup.number().optional().integer().min(0),
    isActive: Yup.boolean().optional(),
})
