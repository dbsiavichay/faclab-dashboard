export type NavigatorFn = (
    path: string,
    options?: { replace?: boolean }
) => void

let navigatorFn: NavigatorFn | null = null

export const setNavigator = (fn: NavigatorFn | null): void => {
    navigatorFn = fn
}

export const navigateTo: NavigatorFn = (path, options) => {
    if (navigatorFn) {
        navigatorFn(path, options)
        return
    }
    if (typeof window !== 'undefined') {
        if (options?.replace) {
            window.location.replace(path)
        } else {
            window.location.href = path
        }
    }
}
