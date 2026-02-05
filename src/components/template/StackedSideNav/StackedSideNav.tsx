import { useState } from 'react'
import {
    NAV_MODE_THEMED,
    SPLITTED_SIDE_NAV_MINI_WIDTH,
    SPLITTED_SIDE_NAV_SECONDARY_WIDTH,
    DIR_LTR,
    DIR_RTL,
    NAV_MODE_TRANSPARENT,
} from '@/constants/theme.constant'
import StackedSideNavMini, { SelectedMenuItem } from './StackedSideNavMini'
import StackedSideNavSecondary from './StackedSideNavSecondary'
import useResponsive from '@/utils/hooks/useResponsive'
import isEmpty from 'lodash/isEmpty'
import { useThemeStore, useAuthStore, useBaseStore } from '@/stores'
import { useTranslation } from 'react-i18next'

const stackedSideNavDefaultStyle = {
    width: SPLITTED_SIDE_NAV_MINI_WIDTH,
}

const StackedSideNav = () => {
    const { t } = useTranslation()

    const [selectedMenu, setSelectedMenu] = useState<SelectedMenuItem>({})
    const [activeKeys, setActiveKeys] = useState<string[]>([])

    const themeColor = useThemeStore((state) => state.themeColor)
    const primaryColorLevel = useThemeStore(
        (state) => state.primaryColorLevel
    )
    const navMode = useThemeStore((state) => state.navMode)
    const mode = useThemeStore((state) => state.mode)
    const direction = useThemeStore((state) => state.direction)
    const currentRouteKey = useBaseStore(
        (state) => state.currentRouteKey
    )
    const userAuthority = useAuthStore((state) => state.user?.authority)

    const { larger } = useResponsive()

    const navColor = (navType: string, mode: string, ableTheme = true) => {
        if (navMode === NAV_MODE_THEMED && ableTheme) {
            return `bg-${themeColor}-${primaryColorLevel} ${navType}-${mode}`
        }
        return `${navType}-${mode}`
    }

    const handleChange = (selected: SelectedMenuItem) => {
        setSelectedMenu(selected)
    }

    const handleCollpase = () => {
        setSelectedMenu({})
        setActiveKeys([])
    }

    const handleSetActiveKey = (key: string[]) => {
        setActiveKeys(key)
    }

    const stackedSideNavSecondaryDirStyle = () => {
        let style = {}
        const marginValue = `${-SPLITTED_SIDE_NAV_SECONDARY_WIDTH}px`
        if (direction === DIR_LTR) {
            style = { marginLeft: marginValue }
        }

        if (direction === DIR_RTL) {
            style = { marginRight: marginValue }
        }

        return style
    }

    return (
        <>
            {larger.md && (
                <div className={`stacked-side-nav`}>
                    <StackedSideNavMini
                        className={`stacked-side-nav-mini ${navColor(
                            'stacked-side-nav-mini',
                            navMode
                        )}`}
                        style={stackedSideNavDefaultStyle}
                        routeKey={currentRouteKey}
                        activeKeys={activeKeys}
                        navMode={navMode}
                        userAuthority={userAuthority as string[]}
                        mode={mode}
                        direction={direction}
                        onChange={handleChange}
                        onSetActiveKey={handleSetActiveKey}
                    />
                    <div
                        className={`stacked-side-nav-secondary ${navColor(
                            'stacked-side-nav-secondary',
                            mode,
                            false
                        )}`}
                        style={{
                            width: SPLITTED_SIDE_NAV_SECONDARY_WIDTH,
                            ...(isEmpty(selectedMenu)
                                ? stackedSideNavSecondaryDirStyle()
                                : {}),
                        }}
                    >
                        {!isEmpty(selectedMenu) && (
                            <StackedSideNavSecondary
                                title={t(
                                    selectedMenu.translateKey as string,
                                    selectedMenu.title as string
                                )}
                                menu={selectedMenu.menu}
                                routeKey={currentRouteKey}
                                navMode={NAV_MODE_TRANSPARENT}
                                direction={direction}
                                userAuthority={userAuthority as string[]}
                                onCollapse={handleCollpase}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default StackedSideNav
