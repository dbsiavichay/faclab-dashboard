import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useThemeStore } from '@/stores'
import useResponsive from '@/utils/hooks/useResponsive'
import NavToggle from '@/components/shared/NavToggle'
import type { CommonProps } from '@/@types/common'

const _SideNavToggle = ({ className }: CommonProps) => {
    const sideNavCollapse = useThemeStore(
        (state) => state.layout.sideNavCollapse
    )
    const setSideNavCollapse = useThemeStore(
        (state) => state.setSideNavCollapse
    )

    const { larger } = useResponsive()

    const onCollapse = () => {
        setSideNavCollapse(!sideNavCollapse)
    }

    return (
        <>
            {larger.md && (
                <div className={className} onClick={onCollapse}>
                    <NavToggle className="text-2xl" toggled={sideNavCollapse} />
                </div>
            )}
        </>
    )
}

const SideNavToggle = withHeaderItem(_SideNavToggle)

export default SideNavToggle
