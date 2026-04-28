import { useContext } from 'react'
import Menu from './DropdownInnerMenu'
import MenuContext from './context/menuContext'
import DropdownItem from './DropdownItem'
import classNames from 'classnames'
import type { DropdownInnerMenuProps } from './DropdownInnerMenu'
import type { ReactNode, Ref } from 'react'

export interface DropdownMenuProps extends DropdownInnerMenuProps {
    eventKey?: string
    title?: string | ReactNode
    id?: string
    ref?: Ref<HTMLElement>
}

const DropdownMenu = (props: DropdownMenuProps) => {
    const { eventKey, title, className, placement, ref, ...rest } = props

    const parentMenu = useContext(MenuContext)

    const dropdownMenuDefaultClass = `dropdown-menu`
    const dropdownMenuPositionClass = placement

    const dropdownMenuClass = classNames(
        dropdownMenuDefaultClass,
        dropdownMenuPositionClass,
        className
    )

    const dropdownSubmenuClass = classNames(
        dropdownMenuDefaultClass,
        'dropdown-submenu'
    )

    const dropdownSubmenu = (
        <Menu
            ref={ref}
            className={dropdownSubmenuClass}
            placement={placement}
            {...rest}
        />
    )

    if (parentMenu) {
        const itemClassName = classNames(className)

        return (
            <DropdownItem
                className={itemClassName}
                submenu={dropdownSubmenu}
                eventKey={eventKey}
            >
                {title}
            </DropdownItem>
        )
    }

    return (
        <Menu
            ref={ref}
            className={dropdownMenuClass}
            placement={placement}
            {...rest}
        />
    )
}

DropdownMenu.displayName = 'DropdownMenu'

export default DropdownMenu
