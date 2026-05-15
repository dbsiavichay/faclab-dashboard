import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useAuthStore, useSession } from '@/stores/useAuthStore'
import { isApiError } from '@/utils/errors/ApiError'
import { ROLE } from '@/constants/roles.constant'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import {
    changePasswordSchema,
    type ChangePasswordFormValues,
} from '../model/schemas'
import { useChangePassword, useLogout } from '../hooks/useAuth'

const ChangePasswordPage = () => {
    const navigate = useNavigate()
    const session = useSession()
    const mandatory = session?.mustChangePassword ?? false

    const [errorMessage, setErrorMessage] = useTimeOutMessage()
    const changePasswordMutation = useChangePassword()
    const logoutMutation = useLogout()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    })

    const onSubmit = async (values: ChangePasswordFormValues) => {
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
                setError('currentPassword', {
                    message: 'Contraseña actual incorrecta',
                })
            } else {
                setErrorMessage(
                    isApiError(err)
                        ? err.message
                        : err instanceof Error
                        ? err.message
                        : 'Error al cambiar la contraseña'
                )
            }
        }
    }

    return (
        <div className="mb-8">
            <div className="mb-8">
                <h3 className="mb-1">
                    {mandatory
                        ? 'Cambia tu contraseña para continuar'
                        : 'Cambiar contraseña'}
                </h3>
                {mandatory && (
                    <p className="text-sm text-amber-600">
                        Tu contraseña es temporal. Debes establecer una nueva
                        antes de continuar.
                    </p>
                )}
            </div>
            {errorMessage && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{errorMessage}</>
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormContainer>
                    <FormItem
                        label="Contraseña actual"
                        invalid={!!errors.currentPassword}
                        errorMessage={errors.currentPassword?.message}
                    >
                        <PasswordInput
                            autoComplete="current-password"
                            placeholder="Contraseña actual"
                            invalid={!!errors.currentPassword}
                            {...register('currentPassword')}
                        />
                    </FormItem>
                    <FormItem
                        label="Nueva contraseña"
                        invalid={!!errors.newPassword}
                        errorMessage={errors.newPassword?.message}
                    >
                        <PasswordInput
                            autoComplete="new-password"
                            placeholder="Mínimo 8 caracteres"
                            invalid={!!errors.newPassword}
                            {...register('newPassword')}
                        />
                    </FormItem>
                    <FormItem
                        label="Confirmar nueva contraseña"
                        invalid={!!errors.confirmNewPassword}
                        errorMessage={errors.confirmNewPassword?.message}
                    >
                        <PasswordInput
                            autoComplete="new-password"
                            placeholder="Repite la nueva contraseña"
                            invalid={!!errors.confirmNewPassword}
                            {...register('confirmNewPassword')}
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
                                onClick={() => logoutMutation.mutateAsync()}
                            >
                                Cerrar sesión
                            </Button>
                        )}
                    </div>
                </FormContainer>
            </form>
        </div>
    )
}

export default ChangePasswordPage
