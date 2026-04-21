import { useSession } from '@/stores/useAuthStore'
import ChangePasswordForm from './ChangePasswordForm'

const ChangePassword = () => {
    const session = useSession()
    const mandatory = session?.mustChangePassword ?? false

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
            <ChangePasswordForm />
        </div>
    )
}

export default ChangePassword
