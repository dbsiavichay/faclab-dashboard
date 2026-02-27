import Logo from '@/components/template/Logo'
import { useThemeStore } from '@/stores'

const HeaderLogo = () => {
    const mode = useThemeStore((state) => state.mode)

    return <Logo mode={mode} className="hidden md:block" />
}

export default HeaderLogo
