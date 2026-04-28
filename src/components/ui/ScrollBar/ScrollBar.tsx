import { Scrollbars } from 'react-custom-scrollbars-2'
import type { ScrollbarProps as ReactCustomScrollbarProps } from 'react-custom-scrollbars-2'
import type { TypeAttributes } from '../@types/common'
import type { Ref } from 'react'

export interface ScrollbarProps extends ReactCustomScrollbarProps {
    direction?: TypeAttributes.Direction
    ref?: Ref<ScrollbarRef>
}

export type ScrollbarRef = Scrollbars

const ScrollBar = (props: ScrollbarProps) => {
    const { direction = 'ltr', ref, ...rest } = props

    return (
        <Scrollbars
            ref={ref}
            renderView={(props) => (
                <div
                    {...props}
                    style={{
                        ...props.style,
                        ...(direction === 'rtl' && {
                            marginLeft: props.style.marginRight,
                            marginRight: 0,
                        }),
                    }}
                />
            )}
            {...rest}
        />
    )
}

ScrollBar.displayName = 'ScrollBar'

export default ScrollBar
