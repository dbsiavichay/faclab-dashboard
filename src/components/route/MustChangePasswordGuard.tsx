import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '@/stores/useAuthStore'

const MustChangePasswordGuard = () => {
    const session = useSession()
    const { pathname } = useLocation()

    if (session?.mustChangePassword && pathname !== '/change-password') {
        return <Navigate replace to="/change-password" />
    }
    return null
}

export default MustChangePasswordGuard
