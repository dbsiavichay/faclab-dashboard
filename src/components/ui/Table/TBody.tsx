import classNames from 'classnames'
import type { ComponentPropsWithRef, ElementType } from 'react'

export interface TBodyProps extends ComponentPropsWithRef<'tbody'> {
    asElement?: ElementType
}

const TBody = (props: TBodyProps) => {
    const {
        asElement: Component = 'tbody',
        children,
        className,
        ref,
        ...rest
    } = props

    const tBodyClass = classNames(Component !== 'tbody' && 'tbody', className)

    return (
        <Component className={tBodyClass} {...rest} ref={ref}>
            {children}
        </Component>
    )
}

TBody.displayName = 'TBody'

export default TBody
