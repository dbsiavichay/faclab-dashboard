import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import type { Ref } from 'react'

type SvgIconProps = CommonProps & {
    ref?: Ref<HTMLSpanElement>
}

const SvgIcon = (props: SvgIconProps) => {
    const { children, className, ref, ...rest } = props

    return (
        <span
            ref={ref}
            className={classNames('inline-flex', className)}
            {...rest}
        >
            {children}
        </span>
    )
}

SvgIcon.displayName = 'SvgIcon'

export default SvgIcon
