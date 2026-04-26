import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useAuth from '@/utils/hooks/useAuth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
}

const signInSchema = z.object({
    username: z
        .string()
        .min(1, 'Ingresa tu usuario')
        .max(64, 'El usuario es demasiado largo'),
    password: z
        .string()
        .min(1, 'Ingresa tu contraseña')
        .max(128, 'La contraseña es demasiado larga'),
})

type SignInFormValues = z.infer<typeof signInSchema>

const SignInForm = (props: SignInFormProps) => {
    const { disableSubmit = false, className } = props

    const [message, setMessage] = useTimeOutMessage()

    const { signIn } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { username: '', password: '' },
    })

    const onSubmit = async ({ username, password }: SignInFormValues) => {
        if (disableSubmit) return

        const result = await signIn({ userName: username, password })

        if (result?.status === 'failed') {
            setMessage(result.message)
        }
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormContainer>
                    <FormItem
                        label="Usuario"
                        invalid={!!errors.username}
                        errorMessage={errors.username?.message}
                    >
                        <Input
                            type="text"
                            autoComplete="username"
                            placeholder="Usuario"
                            invalid={!!errors.username}
                            {...register('username')}
                        />
                    </FormItem>
                    <FormItem
                        label="Contraseña"
                        invalid={!!errors.password}
                        errorMessage={errors.password?.message}
                    >
                        <PasswordInput
                            autoComplete="current-password"
                            placeholder="Contraseña"
                            invalid={!!errors.password}
                            {...register('password')}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                        className="mt-2"
                    >
                        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </FormContainer>
            </form>
        </div>
    )
}

export default SignInForm
