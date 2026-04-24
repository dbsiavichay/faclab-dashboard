import { createContext, useContext } from 'react'
import type { Shift } from '@/services/pos/POSTypes'

export const ShiftContext = createContext<Shift | null>(null)

export const useShift = () => {
    const shift = useContext(ShiftContext)
    if (!shift) {
        throw new Error('useShift must be used within ShiftGuard')
    }
    return shift
}
