import { HiX } from 'react-icons/hi'
import classNames from 'classnames'
import type { CommonProps } from '../@types/common'
import type { MouseEvent, Ref } from 'react'

export interface CloseButtonProps extends CommonProps {
    absolute?: boolean
    defaultStyle?: boolean
    onClick?: (e: MouseEvent<HTMLSpanElement>) => void
    ref?: Ref<HTMLElement>
}

const CloseButton = (props: CloseButtonProps) => {
    const { absolute, className, defaultStyle, ref, ...rest } = props
    const closeButtonAbsoluteClass = 'absolute z-10'

    const closeButtonClass = classNames(
        'close-btn',
        defaultStyle && 'close-btn-default',
        absolute && closeButtonAbsoluteClass,
        className
    )

    return (
        <span className={closeButtonClass} role="button" {...rest} ref={ref}>
            <HiX />
        </span>
    )
}

CloseButton.displayName = 'CloseButton'

export default CloseButton
