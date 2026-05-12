import { useActiveShift } from '../hooks/usePOS'
import Spinner from '@/components/ui/Spinner'
import ShiftOpenDialog from './ShiftOpenDialog'
import { ShiftContext } from './useShift'
import type { ReactNode } from 'react'

interface ShiftGuardProps {
    children: ReactNode
}

const ShiftGuard = ({ children }: ShiftGuardProps) => {
    const { data: shift, isLoading } = useActiveShift()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner size={40} />
            </div>
        )
    }

    if (!shift) {
        return <ShiftOpenDialog />
    }

    return (
        <ShiftContext.Provider value={shift}>{children}</ShiftContext.Provider>
    )
}

export default ShiftGuard
