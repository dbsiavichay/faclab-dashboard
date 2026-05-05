import { useRef } from 'react'
import type { Ref } from 'react'

export default function useUncertainRef<T = unknown>(ref: Ref<T> | undefined) {
    const newRef = useRef<T>(null)

    if (ref) {
        return ref
    }

    return newRef
}
