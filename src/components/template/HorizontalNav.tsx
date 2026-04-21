import HorizontalMenuContent from './HorizontalMenuContent'
import useResponsive from '@/utils/hooks/useResponsive'
import { useThemeStore, useSession } from '@/stores'

const HorizontalNav = () => {
    const mode = useThemeStore((state) => state.mode)
    const userAuthority = useSession()?.permissions ?? []

    const { larger } = useResponsive()

    return (
        <>
            {larger.md && (
                <HorizontalMenuContent
                    manuVariant={mode}
                    userAuthority={userAuthority}
                />
            )}
        </>
    )
}

export default HorizontalNav
