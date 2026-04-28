import classNames from 'classnames'
import type { ComponentPropsWithRef, ElementType } from 'react'

export interface TFootProps extends ComponentPropsWithRef<'tfoot'> {
    asElement?: ElementType
}

const TFoot = (props: TFootProps) => {
    const {
        asElement: Component = 'tfoot',
        children,
        className,
        ref,
        ...rest
    } = props

    const tBodyClass = classNames(Component !== 'tfoot' && 'tfoot', className)

    return (
        <Component className={tBodyClass} {...rest} ref={ref}>
            {children}
        </Component>
    )
}

TFoot.displayName = 'TFoot'

export default TFoot
