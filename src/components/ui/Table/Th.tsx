import classNames from 'classnames'
import type { ComponentPropsWithRef, ElementType } from 'react'

export interface ThProps extends ComponentPropsWithRef<'th'> {
    asElement?: ElementType
}

const Th = (props: ThProps) => {
    const {
        asElement: Component = 'th',
        children,
        className,
        ref,
        ...rest
    } = props

    const thClass = classNames(Component !== 'th' && 'th', className)

    return (
        <Component className={thClass} {...rest} ref={ref}>
            {children}
        </Component>
    )
}

Th.displayName = 'Th'

export default Th
