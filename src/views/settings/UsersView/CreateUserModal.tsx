import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateAdminUser } from '@/hooks/useAdminUsers'
import { isApiError } from '@/utils/errors/ApiError'
import { ROLE, ROLE_LABELS, ALL_ROLES } from '@/constants/roles.constant'
import type { RoleCode } from '@/constants/roles.constant'
import type { CreateUserRequest } from '@/@types/auth'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'

interface CreateUserModalProps {
    open: boolean
    onClose: () => void
}

const roleOptions = ALL_ROLES.map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
}))

const validationSchema = Yup.object().shape({
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

const initialValues: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    role: ROLE.VIEWER,
}

const CreateUserModal = ({ open, onClose }: CreateUserModalProps) => {
    const createUser = useCreateAdminUser()

    const handleClose = () => {
        if (!createUser.isPending) onClose()
    }

    return (
        <Dialog
            isOpen={open}
            width={480}
            shouldCloseOnEsc={!createUser.isPending}
            shouldCloseOnOverlayClick={!createUser.isPending}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <h5 className="mb-4">Nuevo usuario</h5>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (
                    values,
                    { setSubmitting, setFieldError, resetForm }
                ) => {
                    try {
                        await createUser.mutateAsync(values)
                        toast.push(
                            <Notification
                                type="success"
                                title="Usuario creado"
                            />,
                            { placement: 'top-center' }
                        )
                        resetForm()
                        onClose()
                    } catch (err) {
                        if (isApiError(err)) {
                            if (err.code === 'USERNAME_ALREADY_EXISTS') {
                                setFieldError(
                                    'username',
                                    'Este nombre de usuario ya existe'
                                )
                            } else if (err.code === 'EMAIL_ALREADY_EXISTS') {
                                setFieldError(
                                    'email',
                                    'Este email ya está registrado'
                                )
                            } else {
                                toast.push(
                                    <Notification
                                        type="danger"
                                        title={err.message}
                                    />,
                                    { placement: 'top-center' }
                                )
                            }
                        } else {
                            toast.push(
                                <Notification
                                    type="danger"
                                    title="Error al crear el usuario"
                                />,
                                { placement: 'top-center' }
                            )
                        }
                    } finally {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="Usuario"
                                invalid={
                                    (errors.username &&
                                        touched.username) as boolean
                                }
                                errorMessage={errors.username}
                            >
                                <Field
                                    name="username"
                                    autoComplete="off"
                                    placeholder="nombre.usuario"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Email"
                                invalid={
                                    (errors.email && touched.email) as boolean
                                }
                                errorMessage={errors.email}
                            >
                                <Field
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    placeholder="usuario@empresa.com"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Contraseña"
                                invalid={
                                    (errors.password &&
                                        touched.password) as boolean
                                }
                                errorMessage={errors.password}
                            >
                                <Field
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Mínimo 8 caracteres"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Rol"
                                invalid={
                                    (errors.role && touched.role) as boolean
                                }
                                errorMessage={errors.role as string}
                            >
                                <Select
                                    options={roleOptions}
                                    value={
                                        roleOptions.find(
                                            (o) => o.value === values.role
                                        ) ?? null
                                    }
                                    onChange={(opt) =>
                                        setFieldValue(
                                            'role',
                                            (opt?.value ??
                                                ROLE.VIEWER) as RoleCode
                                        )
                                    }
                                />
                            </FormItem>
                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    variant="plain"
                                    disabled={isSubmitting}
                                    type="button"
                                    onClick={handleClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                >
                                    Crear
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </Dialog>
    )
}

export default CreateUserModal
