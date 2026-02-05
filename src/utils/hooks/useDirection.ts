import { useEffect } from 'react'
import { useThemeStore } from '@/stores'
import type { Direction } from '@/@types/theme'

function useDirection(): [
    direction: Direction,
    updateDirection: (dir: Direction) => void
] {
    const direction = useThemeStore((state) => state.direction)
    const setDirection = useThemeStore((state) => state.setDirection)

    const updateDirection = (dir: Direction) => {
        setDirection(dir)
    }

    useEffect(() => {
        if (window === undefined) {
            return
        }
        const root = window.document.documentElement
        root.setAttribute('dir', direction)
    }, [direction])

    return [direction, updateDirection]
}

export default useDirection
