import Radio from '@/components/ui/Radio'
import { useThemeStore } from '@/stores'
import { NAV_MODE_THEMED } from '@/constants/theme.constant'

type NavModeParam = 'default' | 'themed'

const NavModeSwitcher = () => {
    const navMode = useThemeStore((state) => state.navMode)
    const setNavMode = useThemeStore((state) => state.setNavMode)

    const onSetNavMode = (val: NavModeParam) => {
        setNavMode(val)
    }

    return (
        <Radio.Group
            value={navMode === NAV_MODE_THEMED ? NAV_MODE_THEMED : 'default'}
            onChange={onSetNavMode}
        >
            <Radio value="default">Default</Radio>
            <Radio value={NAV_MODE_THEMED}>Themed</Radio>
        </Radio.Group>
    )
}

export default NavModeSwitcher
