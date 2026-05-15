import { useNavigate } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore'
import { useLogin, useLogout } from '@features/auth'
import { isApiError } from '@/utils/errors/ApiError'
import { ROLE } from '@/constants/roles.constant'
import useQuery from './useQuery'

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
    }: {
        userName: string
        password: string
    }): Promise<SignInResult> => {
        try {
            await loginMutation.mutateAsync({ username: userName, password })
            const session = useAuthStore.getState().session
            if (session?.mustChangePassword) {
                navigate('/change-password', { replace: true })
            } else if (session?.role === ROLE.CASHIER) {
                navigate('/pos', { replace: true })
            } else {
                const redirect = query.get(REDIRECT_URL_KEY)
                navigate(redirect ?? appConfig.authenticatedEntryPath)
            }
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

    const signOut = async (): Promise<void> => {
        await logoutMutation.mutateAsync()
    }

    return {
        authenticated,
        signIn,
        signOut,
    }
}

export default useAuth
