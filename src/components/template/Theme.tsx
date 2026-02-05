import ConfigProvider from '@/components/ui/ConfigProvider'
import useDarkMode from '@/utils/hooks/useDarkmode'
import type { CommonProps } from '@/@types/common'
import { themeConfig } from '@/configs/theme.config'
import { useThemeStore, useLocaleStore } from '@/stores'

const Theme = (props: CommonProps) => {
    const theme = useThemeStore()
    const locale = useLocaleStore((state) => state.currentLang)
    useDarkMode()

    const currentTheme = {
        ...themeConfig,
        themeColor: theme.themeColor,
        direction: theme.direction,
        mode: theme.mode,
        primaryColorLevel: theme.primaryColorLevel,
        panelExpand: theme.panelExpand,
        navMode: theme.navMode,
        cardBordered: theme.cardBordered,
        layout: theme.layout,
        locale,
    }

    return (
        <ConfigProvider value={currentTheme}>{props.children}</ConfigProvider>
    )
}

export default Theme
