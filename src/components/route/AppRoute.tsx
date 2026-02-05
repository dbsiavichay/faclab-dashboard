import { useEffect, useCallback } from 'react'
import { useThemeStore, useBaseStore } from '@/stores'
import { useLocation } from 'react-router-dom'
import type { LayoutType } from '@/@types/theme'
import type { ComponentType } from 'react'

export type AppRouteProps<T> = {
    component: ComponentType<T>
    routeKey: string
    layout?: LayoutType
}

const AppRoute = <T extends Record<string, unknown>>({
    component: Component,
    routeKey,
    ...props
}: AppRouteProps<T>) => {
    const location = useLocation()

    const layoutType = useThemeStore((state) => state.layout.type)
    const previousLayout = useThemeStore(
        (state) => state.layout.previousType
    )
    const setLayout = useThemeStore((state) => state.setLayout)
    const setPreviousLayout = useThemeStore((state) => state.setPreviousLayout)
    const setCurrentRouteKey = useBaseStore((state) => state.setCurrentRouteKey)

    const handleLayoutChange = useCallback(() => {
        setCurrentRouteKey(routeKey)

        if (props.layout && props.layout !== layoutType) {
            setPreviousLayout(layoutType)
            setLayout(props.layout)
        }

        if (!props.layout && previousLayout && layoutType !== previousLayout) {
            setLayout(previousLayout)
            setPreviousLayout('')
        }
    }, [layoutType, previousLayout, props.layout, routeKey, setCurrentRouteKey, setLayout, setPreviousLayout])

    useEffect(() => {
        handleLayoutChange()
    }, [location, handleLayoutChange])

    return <Component {...(props as T)} />
}

export default AppRoute
