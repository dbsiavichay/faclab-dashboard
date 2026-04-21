import { useNavigate } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useIsAuthenticated } from '@/stores/useAuthStore'
import { useLogin, useLogout } from '@/hooks/useAuth'
import { isApiError } from '@/utils/errors/ApiError'
import useQuery from './useQuery'
import type { SignInCredential } from '@/@types/auth'

type Status = 'success' | 'failed'
type SignInResult = { status: Status; message: string }

function useAuth() {
    const navigate = useNavigate()
    const query = useQuery()
    const authenticated = useIsAuthenticated()
    const loginMutation = useLogin()
    const logoutMutation = useLogout()

    const signIn = async ({
        userName,
        password,
    }: SignInCredential): Promise<SignInResult> => {
        try {
            await loginMutation.mutateAsync({ username: userName, password })
            const redirect = query.get(REDIRECT_URL_KEY)
            navigate(redirect ?? appConfig.authenticatedEntryPath)
            return { status: 'success', message: '' }
        } catch (err) {
            return {
                status: 'failed',
                message: isApiError(err)
                    ? err.message
                    : err instanceof Error
                    ? err.message
                    : String(err),
            }
        }
    }

    const signUp = async (_credentials?: unknown): Promise<SignInResult> => ({
        status: 'failed',
        message: 'Sign up deshabilitado',
    })

    const signOut = async (): Promise<void> => {
        await logoutMutation.mutateAsync()
    }

    return {
        authenticated,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
