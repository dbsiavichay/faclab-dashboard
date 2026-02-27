import classNames from 'classnames'
import HorizontalMenuContent from '@/components/template/HorizontalMenuContent'
import { NAV_MODE_THEMED } from '@/constants/theme.constant'
import useResponsive from '@/utils/hooks/useResponsive'
import { useThemeStore, useAuthStore } from '@/stores'
import type { CommonProps } from '@/@types/common'

interface SecondaryHeaderProps extends CommonProps {
    contained: boolean
}

const SecondaryHeader = (props: SecondaryHeaderProps) => {
    const { className, contained } = props

    const navMode = useThemeStore((state) => state.navMode)
    const themeColor = useThemeStore((state) => state.themeColor)
    const primaryColorLevel = useThemeStore((state) => state.primaryColorLevel)
    const userAuthority = useAuthStore((state) => state.user?.authority)

    const { larger } = useResponsive()

    const headerColor = () => {
        if (navMode === NAV_MODE_THEMED) {
            return `bg-${themeColor}-${primaryColorLevel} secondary-header-${navMode}`
        }
        return `secondary-header-${navMode}`
    }

    return (
        <>
            {larger.md && (
                <div
                    className={classNames(
                        'h-16 flex items-center',
                        headerColor(),
                        className
                    )}
                >
                    <div
                        className={classNames(
                            'flex items-center px-4',
                            contained && 'container mx-auto'
                        )}
                    >
                        <HorizontalMenuContent
                            manuVariant={navMode}
                            userAuthority={userAuthority}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default SecondaryHeader
