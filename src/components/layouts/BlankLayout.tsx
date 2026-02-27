import View from '@/views'
import SidePanel from '@/components/template/SidePanel'
import { useThemeStore } from '@/stores'
import { HiOutlineCog } from 'react-icons/hi'
import classNames from 'classnames'

const ConfiguratorToggle = () => {
    const themeColor = useThemeStore((state) => state.themeColor)
    const primaryColorLevel = useThemeStore((state) => state.primaryColorLevel)
    const setPanelExpand = useThemeStore((state) => state.setPanelExpand)

    return (
        <div
            className={classNames(
                'fixed ltr:right-0 rtl:left-0 top-96 p-3 ltr:rounded-tl-md ltr:rounded-bl-md rtl:rounded-tr-md rtl:rounded-br-md text-white text-xl cursor-pointer select-none',
                `bg-${themeColor}-${primaryColorLevel}`
            )}
            onClick={() => {
                setPanelExpand(true)
            }}
        >
            <HiOutlineCog />
        </div>
    )
}

const BlankLayout = () => {
    return (
        <div className="app-layout-blank flex flex-auto flex-col h-[100vh]">
            <View />
            <ConfiguratorToggle />
            <SidePanel className="hidden" />
        </div>
    )
}

export default BlankLayout
