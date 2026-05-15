import { useNavigate } from 'react-router-dom'
import appConfig from '@/configs/app.config'

const { authenticatedEntryPath } = appConfig

const AccessDeniedPage = () => {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h1 className="text-2xl font-semibold">Sin acceso</h1>
            <p className="text-gray-500">
                No tienes permiso para ver esta página.
            </p>
            <button
                className="btn btn-primary"
                onClick={() => navigate(authenticatedEntryPath)}
            >
                Volver al inicio
            </button>
        </div>
    )
}

export default AccessDeniedPage
