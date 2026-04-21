import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useChangePassword, useLogout } from '@/hooks/useAuth'
import { useAuthStore, useSession } from '@/stores/useAuthStore'
import { isApiError } from '@/utils/errors/ApiError'
import { ROLE } from '@/constants/roles.constant'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import appConfig from '@/configs/app.config'

type ChangePasswordSchema = {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Ingresa tu contraseña actual'),
    newPassword: Yup.string()
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
        .max(128, 'La contraseña es demasiado larga')
        .required('Ingresa tu nueva contraseña'),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Las contraseñas no coinciden')
        .required('Confirma tu nueva contraseña'),
})

const ChangePasswordForm = () => {
    const navigate = useNavigate()
    const session = useSession()
    const mandatory = session?.mustChangePassword ?? false

    const [errorMessage, setErrorMessage] = useTimeOutMessage()
    const changePasswordMutation = useChangePassword()
    const logoutMutation = useLogout()

    const onSubmit = async (
        values: ChangePasswordSchema,
        setSubmitting: (v: boolean) => void,
        setFieldError: (field: string, msg: string) => void
    ) => {
        setSubmitting(true)
        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            })
            const role = useAuthStore.getState().session?.role
            if (role === ROLE.CASHIER) {
                navigate('/pos', { replace: true })
            } else {
                navigate(appConfig.authenticatedEntryPath, { replace: true })
            }
        } catch (err) {
            if (isApiError(err) && err.code === 'INVALID_CREDENTIALS') {
                setFieldError('currentPassword', 'Contraseña actual incorrecta')
            } else {
                setErrorMessage(
                    isApiError(err)
                        ? err.message
                        : err instanceof Error
                        ? err.message
                        : 'Error al cambiar la contraseña'
                )
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            {errorMessage && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{errorMessage}</>
                </Alert>
            )}
            <Formik
                initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setFieldError }) => {
                    onSubmit(values, setSubmitting, setFieldError)
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="Contraseña actual"
                                invalid={
                                    (errors.currentPassword &&
                                        touched.currentPassword) as boolean
                                }
                                errorMessage={errors.currentPassword}
                            >
                                <Field
                                    autoComplete="current-password"
                                    name="currentPassword"
                                    placeholder="Contraseña actual"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label="Nueva contraseña"
                                invalid={
                                    (errors.newPassword &&
                                        touched.newPassword) as boolean
                                }
                                errorMessage={errors.newPassword}
                            >
                                <Field
                                    autoComplete="new-password"
                                    name="newPassword"
                                    placeholder="Mínimo 8 caracteres"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label="Confirmar nueva contraseña"
                                invalid={
                                    (errors.confirmNewPassword &&
                                        touched.confirmNewPassword) as boolean
                                }
                                errorMessage={errors.confirmNewPassword}
                            >
                                <Field
                                    autoComplete="new-password"
                                    name="confirmNewPassword"
                                    placeholder="Repite la nueva contraseña"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <div className="flex flex-col gap-2 mt-2">
                                <Button
                                    block
                                    loading={isSubmitting}
                                    variant="solid"
                                    type="submit"
                                >
                                    {isSubmitting
                                        ? 'Guardando...'
                                        : 'Cambiar contraseña'}
                                </Button>
                                {!mandatory && (
                                    <Button
                                        block
                                        disabled={isSubmitting}
                                        type="button"
                                        variant="plain"
                                        onClick={() => navigate(-1)}
                                    >
                                        Volver
                                    </Button>
                                )}
                                {mandatory && (
                                    <Button
                                        block
                                        disabled={isSubmitting}
                                        type="button"
                                        variant="plain"
                                        onClick={() =>
                                            logoutMutation.mutateAsync()
                                        }
                                    >
                                        Cerrar sesión
                                    </Button>
                                )}
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ChangePasswordForm
