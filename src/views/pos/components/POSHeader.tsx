import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useShift } from './ShiftGuard'

interface POSHeaderProps {
    onOpenCloseShift?: () => void
    onOpenCashMovement?: () => void
}

const POSHeader = ({
    onOpenCloseShift,
    onOpenCashMovement,
}: POSHeaderProps) => {
    const navigate = useNavigate()
    const shift = useShift()
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const formattedDate = currentTime.toLocaleDateString('es-EC', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <span className="font-semibold text-lg">POS</span>
                <span className="px-2 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    Turno #{shift.id} — {shift.cashierName}
                </span>
            </div>

            <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                {formattedDate}
            </span>

            <div className="flex items-center gap-2">
                <Button size="sm" variant="plain" onClick={onOpenCashMovement}>
                    Caja
                </Button>
                <Button size="sm" variant="plain" onClick={onOpenCloseShift}>
                    Cerrar Turno
                </Button>
                <Button
                    size="sm"
                    variant="solid"
                    onClick={() => navigate('/home')}
                >
                    Volver al Dashboard
                </Button>
            </div>
        </div>
    )
}

export default POSHeader
